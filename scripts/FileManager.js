const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class FileManager {
  constructor() {
    // Dossier de stockage des fichiers
    this.uploadDir = path.join(__dirname, '..', 'uploads');
    this.tempDir = path.join(__dirname, '..', 'uploads', 'temp');
    this.ensureUploadDirExists();
    this.ensureTempDirExists();
  }

  /**
   * S'assure que le dossier uploads existe
   */
  ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      console.log('📁 Dossier uploads créé:', this.uploadDir);
    }
  }

  /**
   * S'assure que le dossier temp existe
   */
  ensureTempDirExists() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
      console.log('📁 Dossier temp créé:', this.tempDir);
    }
  }

  /**
   * Génère un nom de fichier unique
   * @param {string} originalName - Nom original du fichier
   * @returns {string} - Nom de fichier unique
   */
  generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    return `${nameWithoutExt}_${timestamp}_${randomString}${ext}`;
  }

  /**
   * Persiste un fichier sur le serveur et retourne l'URL complète
   * @param {Object} file - Objet fichier de multer
   * @param {Object} req - Objet request Express pour obtenir le host
   * @returns {Promise<Object>} - Objet contenant l'URL et les infos du fichier
   */
  async persistFile(file, req) {
    try {
      if (!file) {
        throw new Error('Aucun fichier fourni');
      }

      // Générer un nom de fichier unique
      const uniqueFilename = this.generateUniqueFilename(file.originalname);
      const filePath = path.join(this.uploadDir, uniqueFilename);

      // Écrire le fichier sur le disque
      if (file.buffer) {
        // Si le fichier est en mémoire (multer memoryStorage)
        fs.writeFileSync(filePath, file.buffer);
      } else if (file.path) {
        // Si le fichier est déjà sur le disque (multer diskStorage)
        fs.renameSync(file.path, filePath);
      } else {
        throw new Error('Format de fichier non supporté');
      }

      // Construire l'URL complète
      const protocol = req.protocol; // http ou https
      const host = req.get('host'); // localhost:4003 ou domaine
      const relativePath = `/uploads/${uniqueFilename}`;
      const fullUrl = `https://${host}${relativePath}`;

      return {
        success: true,
        url: fullUrl,
        filename: uniqueFilename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: relativePath
      };
    } catch (error) {
      console.error('❌ Erreur lors de la persistance du fichier:', error);
      throw error;
    }
  }

  /**
   * Persiste plusieurs fichiers
   * @param {Array} files - Tableau de fichiers
   * @param {Object} req - Objet request Express
   * @returns {Promise<Array>} - Tableau d'objets contenant les URLs
   */
  async persistFiles(files, req) {
    try {
      if (!files || files.length === 0) {
        throw new Error('Aucun fichier fourni');
      }

      const results = [];
      for (const file of files) {
        const result = await this.persistFile(file, req);
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error('❌ Erreur lors de la persistance des fichiers:', error);
      throw error;
    }
  }

  /**
   * Supprime un fichier du serveur
   * @param {string} filename - Nom du fichier à supprimer
   * @returns {boolean} - True si supprimé avec succès
   */
  deleteFile(filename) {
    try {
      const filePath = path.join(this.uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Fichier supprimé:', filename);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du fichier:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un fichier existe
   * @param {string} filename - Nom du fichier
   * @returns {boolean}
   */
  fileExists(filename) {
    const filePath = path.join(this.uploadDir, filename);
    return fs.existsSync(filePath);
  }

  getFile(filename) {
    const filePath = path.join(this.uploadDir, filename);
    return fs.readFileSync(filePath);
  }

  /**
   * Sauvegarde un chunk de fichier
   * @param {Object} chunk - Buffer du chunk
   * @param {string} uploadId - ID unique de l'upload
   * @param {number} chunkIndex - Index du chunk
   * @param {string} fileName - Nom original du fichier
   * @returns {Object} - Info sur le chunk sauvegardé
   */
  saveChunk(chunk, uploadId, chunkIndex, fileName) {
    try {
      // Créer un dossier pour cet upload
      const uploadTempDir = path.join(this.tempDir, uploadId);
      if (!fs.existsSync(uploadTempDir)) {
        fs.mkdirSync(uploadTempDir, { recursive: true });
      }

      // Sauvegarder le chunk
      const chunkPath = path.join(uploadTempDir, `chunk_${chunkIndex}`);
      fs.writeFileSync(chunkPath, chunk);

      // Sauvegarder les métadonnées si c'est le premier chunk
      if (chunkIndex === 0) {
        const metadataPath = path.join(uploadTempDir, 'metadata.json');
        fs.writeFileSync(metadataPath, JSON.stringify({
          fileName,
          uploadId,
          startTime: Date.now()
        }));
      }

      console.log(`✅ Chunk ${chunkIndex} sauvegardé pour upload ${uploadId}`);
      return {
        success: true,
        chunkIndex,
        uploadId
      };
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du chunk:', error);
      throw error;
    }
  }

  /**
   * Assemble tous les chunks en un fichier final
   * @param {string} uploadId - ID unique de l'upload
   * @param {number} totalChunks - Nombre total de chunks
   * @param {string} fileName - Nom original du fichier
   * @param {string} fileType - Type MIME du fichier
   * @param {Object} req - Objet request Express
   * @returns {Promise<Object>} - Info sur le fichier assemblé
   */
  async assembleChunks(uploadId, totalChunks, fileName, fileType, req) {
    try {
      const uploadTempDir = path.join(this.tempDir, uploadId);
      
      // Vérifier que tous les chunks sont présents
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(uploadTempDir, `chunk_${i}`);
        if (!fs.existsSync(chunkPath)) {
          throw new Error(`Chunk ${i} manquant`);
        }
      }

      // Générer un nom de fichier unique pour le fichier final
      const uniqueFilename = this.generateUniqueFilename(fileName);
      const finalPath = path.join(this.uploadDir, uniqueFilename);

      // Créer un stream d'écriture pour le fichier final
      const writeStream = fs.createWriteStream(finalPath);

      // Assembler les chunks
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(uploadTempDir, `chunk_${i}`);
        const chunkBuffer = fs.readFileSync(chunkPath);
        writeStream.write(chunkBuffer);
      }

      // Fermer le stream
      writeStream.end();

      // Attendre que l'écriture soit terminée
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      // Nettoyer les chunks temporaires
      this.cleanupTempUpload(uploadId);

      // Obtenir la taille du fichier final
      const stats = fs.statSync(finalPath);

      // Construire l'URL complète
      const protocol = req.protocol;
      const host = req.get('host');
      const relativePath = `/uploads/${uniqueFilename}`;
      const fullUrl = `https://${host}${relativePath}`;

      console.log(`✅ Fichier assemblé: ${uniqueFilename} (${stats.size} bytes)`);

      return {
        success: true,
        url: fullUrl,
        filename: uniqueFilename,
        originalName: fileName,
        mimetype: fileType,
        size: stats.size,
        path: relativePath
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'assemblage des chunks:', error);
      // Nettoyer en cas d'erreur
      this.cleanupTempUpload(uploadId);
      throw error;
    }
  }

  /**
   * Nettoie les fichiers temporaires d'un upload
   * @param {string} uploadId - ID de l'upload à nettoyer
   */
  cleanupTempUpload(uploadId) {
    try {
      const uploadTempDir = path.join(this.tempDir, uploadId);
      if (fs.existsSync(uploadTempDir)) {
        fs.rmSync(uploadTempDir, { recursive: true, force: true });
        console.log(`🧹 Nettoyage des fichiers temporaires pour ${uploadId}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
    }
  }

  /**
   * Nettoie les uploads temporaires expirés (plus de 24h)
   */
  cleanupExpiredUploads() {
    try {
      if (!fs.existsSync(this.tempDir)) return;

      const uploads = fs.readdirSync(this.tempDir);
      const now = Date.now();
      const expirationTime = 24 * 60 * 60 * 1000; // 24 heures

      uploads.forEach(uploadId => {
        const uploadDir = path.join(this.tempDir, uploadId);
        const metadataPath = path.join(uploadDir, 'metadata.json');
        
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          if (now - metadata.startTime > expirationTime) {
            this.cleanupTempUpload(uploadId);
            console.log(`🧹 Upload expiré nettoyé: ${uploadId}`);
          }
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des uploads expirés:', error);
    }
  }
}

module.exports = new FileManager();