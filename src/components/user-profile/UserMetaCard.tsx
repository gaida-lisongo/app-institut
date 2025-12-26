"use client";
import React, { useCallback, useRef } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";
import { useLogout, useUserStore } from "@/store/useUserStore";


export default function UserMetaCard() {
  const { agent, updatePhoto } = useUserStore();
  const logout = useLogout();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = useCallback(async () => {
    await logout();
    // redirect to /login
    window.location.href = "/signin";
  }, [logout]); 

  const handlePhotoUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && updatePhoto) {
      try {
        // TODO: Appel API pour upload de photo
        console.log('Uploading photo:', file);
        await updatePhoto(file);
      } catch (error) {
        console.error('Erreur lors du téléchargement de la photo:', error);
      }
    }
  }, [updatePhoto]);

  console.log('Agent dans UserMetaCard:', agent);

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="relative w-20 h-20">
              <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                {
                  agent?.photo ?
                  <Image
                    width={80}
                    height={80}
                    src={agent.photo}
                    alt="user"
                  />
                  :
                  <div className="flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 text-3xl font-semibold text-gray-600 dark:text-gray-300">
                    {agent ? `${agent.nom.charAt(0)}${agent.post_nom.charAt(0)}` : 'UU'}
                  </div>
                }
              </div>
              {/* Bouton pour changer la photo */}
              <button
                onClick={handlePhotoUpload}
                className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full border-2 border-white dark:border-gray-900 transition-colors duration-200"
                title="Changer la photo"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              {/* Input file caché */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {agent ? `${agent.nom} ${agent.post_nom} ${agent.prenom}` : 'Nom de l\'utilisateur'}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {agent ? agent.matricule : ''}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {agent ? agent?.grade?.code : ''}, {(agent ? agent?.grade?.type : '').toUpperCase()}
                </p>
              </div>
            </div>
            
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-red px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 xl:w-auto xl:inline-flex"
          >
            {/* svg of user disconnect */}
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
            Deconnexion
          </button>
        </div>
      </div>
    </>
  );
}
