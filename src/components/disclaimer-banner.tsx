"use client";

import { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

export function DisclaimerBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("fb-unfollow-disclaimer-dismissed");
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem("fb-unfollow-disclaimer-dismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-amber-950/90 border-b border-amber-700/50 text-amber-100 px-4 py-3">
      <div className="container mx-auto max-w-6xl flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-400" />
        <div className="flex-1 text-sm">
          <strong>Legal disclaimer:</strong> This tool automates clicks on Facebook. Meta&apos;s
          Terms of Service prohibit automation. Use a backup/secondary account. Use at your own risk.
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-amber-200 hover:text-white hover:bg-amber-800/50"
          onClick={dismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
