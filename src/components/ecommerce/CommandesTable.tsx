'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { Commande } from "./CommandesChart";
import { Dropdown } from "../ui/dropdown/Dropdown";
import React, { useEffect, useState } from "react";
import { MoreDotIcon } from "@/icons";
import CommandeDetailModal from "./CommandeDetailModal";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import CommandeCard from "./CommandeCard";

// Define the TypeScript interface for the table rows
interface Product {
  id: number; // Unique identifier for each product
  name: string; // Product name
  variants: string; // Number of variants (e.g., "1 Variant", "2 Variants")
  category: string; // Category of the product
  price: string; // Price of the product (as a string with currency symbol)
  // status: string; // Status of the product
  image: string; // URL or path to the product image
  status: "Delivered" | "Pending" | "Canceled"; // Status of the product
}

// Define the table data using the interface
const tableData: Product[] = [
  {
    id: 1,
    name: "MacBook Pro 13”",
    variants: "2 Variants",
    category: "Laptop",
    price: "$2399.00",
    status: "Delivered",
    image: "/images/product/product-01.jpg", // Replace with actual image URL
  },
  {
    id: 2,
    name: "Apple Watch Ultra",
    variants: "1 Variant",
    category: "Watch",
    price: "$879.00",
    status: "Pending",
    image: "/images/product/product-02.jpg", // Replace with actual image URL
  },
  {
    id: 3,
    name: "iPhone 15 Pro Max",
    variants: "2 Variants",
    category: "SmartPhone",
    price: "$1869.00",
    status: "Delivered",
    image: "/images/product/product-03.jpg", // Replace with actual image URL
  },
  {
    id: 4,
    name: "iPad Pro 3rd Gen",
    variants: "2 Variants",
    category: "Electronics",
    price: "$1699.00",
    status: "Canceled",
    image: "/images/product/product-04.jpg", // Replace with actual image URL
  },
  {
    id: 5,
    name: "AirPods Pro 2nd Gen",
    variants: "1 Variant",
    category: "Accessories",
    price: "$240.00",
    status: "Delivered",
    image: "/images/product/product-05.jpg", // Replace with actual image URL
  },
];

interface CommandesTablesProps {
  data: any[];

}

export default function CommandesTable({ data }: CommandesTablesProps) {
  const produits = [
    'Bulletin',
    'Recours',
    'Travail',
    'Enrollement'
  ]
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [produit, setProduit] = useState<string>(produits[0]);
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleRowClick = (commande: Commande) => {
    setSelectedCommande(commande);
    setIsModalOpen(true);
  };
  useEffect(() => {
    if (data && data.length > 0) {
      let allCommandes: Commande[] = [];
      data.forEach(promo => {
        if (promo.commandes && promo.commandes.length > 0) {
          const commandesWithParentInfo = promo.commandes.map(cmd => ({ ...cmd, promotion: promo }));
          allCommandes = [...allCommandes, ...commandesWithParentInfo];
        }
      });

      const filteredCommandes = allCommandes.filter(commande => {
        const productMatch = produit === 'Bulletin' ? (commande.produit === 'Bulletin' || !commande.produit) : commande.produit === produit;
        
        const searchTermLower = searchTerm.toLowerCase();
        const searchMatch = !searchTerm ||
          commande.etudiantId?.nom?.toLowerCase().includes(searchTermLower) ||
          commande.etudiantId?.post_nom?.toLowerCase().includes(searchTermLower) ||
          commande.etudiantId?.matricule?.toLowerCase().includes(searchTermLower) ||
          commande.promotionId?.designation?.toLowerCase().includes(searchTermLower) ||
          commande.anneeId?.debut?.toString().includes(searchTermLower);

        return productMatch && searchMatch;
      });

      setCommandes(filteredCommandes);
    } else {
      setCommandes([]);
    }
  }, [data, produit, searchTerm]);

  return (
    <React.Fragment>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 min-h-[calc(50vh-10rem)]">
        <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Commandes {produit}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Rechercher (étudiant, classe, année)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <div className="relative inline-block">
              <button onClick={toggleDropdown} className="dropdown-toggle p-2 border rounded-lg dark:border-gray-600">
                <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
              </button>
              <Dropdown
                isOpen={isOpen}
                onClose={closeDropdown}
                className="w-40 p-2"
              >
                {
                  produits.map(p => (
                    <DropdownItem
                      key={p}
                      onItemClick={() => {
                        setProduit(p);
                        closeDropdown();
                      }}
                      className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                    >
                      {p}
                    </DropdownItem>
                  ))
                }
              </Dropdown>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {commandes.map((commande) => (
            <CommandeCard key={commande._id} commande={commande} onClick={() => handleRowClick(commande)} />
          ))}
        </div>
      </div>
      <CommandeDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} commande={selectedCommande} />
    </React.Fragment>
  );
}
