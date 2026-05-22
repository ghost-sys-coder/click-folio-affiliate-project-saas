"use client";

import { Check, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminThemeOptions, useAdminTheme } from "./admin-theme";

export function AdminThemeSwitcher() {
  const { theme, setTheme } = useAdminTheme();
  const currentTheme =
    adminThemeOptions.find((option) => option.value === theme) ??
    adminThemeOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Palette />
          <span className="hidden sm:inline">{currentTheme.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Dashboard theme</DropdownMenuLabel>
        {adminThemeOptions.map((option) => {
          const Icon = option.icon;
          const selected = option.value === theme;

          return (
            <DropdownMenuItem
              key={option.value}
              className="gap-2"
              onSelect={() => setTheme(option.value)}
            >
              <Icon />
              <span className="grid flex-1 gap-0.5">
                <span>{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              </span>
              {selected ? <Check className="ml-auto" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
