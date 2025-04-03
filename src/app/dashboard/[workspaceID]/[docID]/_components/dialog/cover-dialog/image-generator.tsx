"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { generateImage } from "@/lib/gemini/client";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const STYLE_CATEGORIES = {
  "Art Styles": [
    { id: "artistic", name: "Artistic" },
    { id: "abstract", name: "Abstract" },
    { id: "impressionist", name: "Impressionist" },
    { id: "watercolor", name: "Watercolor" },
    { id: "pop-art", name: "Pop Art" },
    { id: "surreal", name: "Surreal" },
  ],
  "Digital Styles": [
    { id: "pixel-art", name: "Pixel Art" },
    { id: "low-poly", name: "Low Poly" },
    { id: "minimalist", name: "Minimalist" },
    { id: "sketch", name: "Sketch" },
  ],
  "Thematic Styles": [
    { id: "ghibli", name: "Ghibli" },
    { id: "fantasy", name: "Fantasy" },
    { id: "cyberpunk", name: "Cyberpunk" },
    { id: "vaporwave", name: "Vaporwave" },
    { id: "steampunk", name: "Steampunk" },
    { id: "futuristic", name: "Futuristic" },
    { id: "realistic", name: "Realistic" },
    { id: "retro", name: "Retro" },
  ],
};

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("ghibli");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showStylePicker, setShowStylePicker] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Empty prompt", {
        description: "Please enter a description for your image",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await generateImage(
        `${prompt} in ${style} style, ultra-high resolution, 4K, highly detailed, vibrant colors, photorealistic`
      );
      setImageUrl(result.imageUrl);
      setShowStylePicker(false);
    } catch (err) {
      toast("Generation failed", {
        description: "We couldn't generate your image. Please try again.",
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewImage = () => {
    setImageUrl(null);
    setShowStylePicker(true);
    setPrompt("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Textarea
          id="prompt"
          placeholder="A serene mountain landscape with a lake reflecting the sunset sky..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
          className="h-20 resize-none"
        />

        {showStylePicker && (
          <div className="space-y-4">
            {Object.entries(STYLE_CATEGORIES).map(
              ([category, styleOptions]) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {category}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {styleOptions.map((option) => (
                      <div
                        key={option.id}
                        className={cn(
                          "relative aspect-video cursor-pointer rounded-md overflow-hidden group transition-all",
                          style === option.id
                            ? "ring-2 ring-primary ring-offset-2"
                            : "hover:opacity-90"
                        )}
                        onClick={() => setStyle(option.id)}>
                        <Image
                          src={`/assets/image/${option.id}.jpg`}
                          alt={option.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                          <p className="absolute bottom-2 left-2 text-white font-medium text-sm">
                            {option.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          {imageUrl && (
            <Button type="button" variant="outline" onClick={handleNewImage}>
              <ImageIcon />
              New Image
            </Button>
          )}
          <Button type="submit" disabled={isLoading} className="min-w-32">
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Image"
            )}
          </Button>
        </div>
      </form>

      {(imageUrl || isLoading) && (
        <div className="border shadow-sm overflow-hidden">
          {imageUrl ? (
            <div className="w-full">
              <div className="relative rounded-md aspect-square w-full">
                <Image
                  src={imageUrl}
                  alt="Generated image"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="p-4 bg-muted/10 border-t">
                <p className="text-sm font-medium">
                  {prompt} •{" "}
                  <span className="text-muted-foreground">{style} style</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="relative aspect-square w-full flex items-center justify-center bg-muted/20">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin" />
                <p>Creating your masterpiece...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
