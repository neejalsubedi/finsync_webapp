"use client";

import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { getCategories, getCategoryIcon } from "@/lib/categories";

interface CategorySelectProps {
  type: "income" | "expense";
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function CategorySelect({
  type,
  value,
  onChange,
  className = "",
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = getCategories(type);
  const selectedCategory = categories.find((c) => c.name === value);
  const SelectedIcon = selectedCategory?.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
        {selectedCategory ? (
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                type === "income"
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                  : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
              }`}
            >
              {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
            </div>
            <span className="font-medium">{selectedCategory.name}</span>
          </div>
        ) : (
          <span className="text-gray-400">Select category</span>
        )}
        <FiChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <ul className="max-h-60 overflow-auto p-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = category.name === value;

              return (
                <li key={category.name}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(category.name);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? "bg-gray-100 dark:bg-gray-700"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        type === "income"
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`font-medium ${
                        isSelected
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {category.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
