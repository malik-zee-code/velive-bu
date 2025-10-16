// PropertyImageManager.tsx - Manages property images with drag and drop
"use client";
import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlusCircle, Star, Trash2, GripVertical, XIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { propertyImageService, PropertyImage } from "@/lib/services";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PropertyImageManagerProps {
    editingProperty: any;
    setEditingProperty: (property: any) => void;
    pendingImages: File[];
    setPendingImages: (images: File[] | ((prev: File[]) => File[])) => void;
    imagesToDelete: string[];
    setImagesToDelete: (ids: string[] | ((prev: string[]) => string[])) => void;
}

// Sortable Image Component
const SortableImageItem = React.memo(({ image, index, onSetPrimary, onDelete }: {
    image: any;
    index: number;
    onSetPrimary: () => void;
    onDelete: () => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id || image._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative group ${isDragging ? 'cursor-grabbing' : ''}`}
        >
            <div className="aspect-square rounded-lg overflow-hidden border bg-white shadow-sm">
                <Image
                    src={image.fileUrl}
                    alt={image.altText || `Property image ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover select-none"
                    draggable={false}
                />
            </div>
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 right-2 bg-white/95 hover:bg-white p-2 rounded cursor-grab active:cursor-grabbing shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <GripVertical className="w-4 h-4 text-gray-700" />
            </div>
            {image.isPrimary && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1 shadow-sm">
                    <span>★</span>
                    Primary
                </div>
            )}
            {!isDragging && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                    <Button
                        type="button"
                        size="sm"
                        variant={image.isPrimary ? "secondary" : "default"}
                        onClick={onSetPrimary}
                        disabled={image.isPrimary}
                    >
                        <Star className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={onDelete}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
});

SortableImageItem.displayName = 'SortableImageItem';

export const PropertyImageManager: React.FC<PropertyImageManagerProps> = ({
    editingProperty,
    setEditingProperty,
    pendingImages,
    setPendingImages,
    imagesToDelete,
    setImagesToDelete,
}) => {
    const { toast } = useToast();
    const [activeImageId, setActiveImageId] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    // File validation helper
    const validateFiles = (files: FileList): File[] => {
        const validFiles: File[] = [];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        Array.from(files).forEach((file) => {
            if (!allowedTypes.includes(file.type)) {
                toast({
                    title: "Invalid file type",
                    description: `${file.name} is not a supported image format`,
                    variant: "destructive",
                });
                return;
            }
            if (file.size > maxSize) {
                toast({
                    title: "File too large",
                    description: `${file.name} is larger than 10MB`,
                    variant: "destructive",
                });
                return;
            }
            validFiles.push(file);
        });

        return validFiles;
    };

    // Handle file processing
    const processFiles = useCallback((files: File[]) => {
        // Both edit and create mode: store files for later upload
        setPendingImages((prev) => [...prev, ...files]);
        toast({
            title: "Images Selected",
            description: `${files.length} image(s) will be uploaded when you ${editingProperty ? 'update' : 'save'} the property`,
        });
    }, [editingProperty, setPendingImages, toast]);

    // Drag and drop handlers
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only show drag over for file drops, not for image reordering
        if (e.dataTransfer.types.includes('Files')) {
            setIsDragOver(true);
        }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const validFiles = validateFiles(files);
            if (validFiles.length > 0) {
                processFiles(validFiles);
            }
        }
    }, [processFiles, toast]);

    // Drag and drop sensors with activation constraints for better performance
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement required to start drag
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Handle drag start
    const handleDragStart = (event: DragStartEvent) => {
        setActiveImageId(event.active.id as string);
    };

    // Handle drag end for images
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveImageId(null);

        if (!over || active.id === over.id || !editingProperty) {
            return;
        }

        const images = editingProperty.images || [];
        const oldIndex = images.findIndex((img: any) => (img.id || img._id) === active.id);
        const newIndex = images.findIndex((img: any) => (img.id || img._id) === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newImages = arrayMove(images, oldIndex, newIndex);

            // Update local state immediately for smooth UX
            setEditingProperty({
                ...editingProperty,
                images: newImages,
            });

            // Update order in backend (debounced/async)
            try {
                const imageOrders = newImages.map((img: any, index: number) => ({
                    id: img.id || img._id,
                    order: index,
                }));

                await propertyImageService.updateImagesOrder(imageOrders);
            } catch (error) {
                console.error("Failed to update image order:", error);
                // Revert on error
                setEditingProperty({
                    ...editingProperty,
                    images,
                });
                toast({
                    title: "Error",
                    description: "Failed to update image order",
                    variant: "destructive",
                });
            }
        }
    };

    const handleAddMoreImages = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.multiple = true;
        input.onchange = async (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                const validFiles = validateFiles(files);
                if (validFiles.length > 0) {
                    processFiles(validFiles);
                }
            }
        };
        input.click();
    };

    const handleUploadImages = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.multiple = true;
        input.onchange = async (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                const validFiles = validateFiles(files);
                if (validFiles.length > 0) {
                    processFiles(validFiles);
                }
            }
        };
        input.click();
    };

    const handleSetPrimary = (imageId: string) => {
        if (editingProperty && editingProperty.images) {
            propertyImageService.setPrimaryPropertyImage(imageId);

            const updatedImages = editingProperty.images.map((img: any) => ({
                ...img,
                isPrimary: (img.id || img._id) === imageId,
            }));
            setEditingProperty({
                ...editingProperty,
                images: updatedImages,
            });
        }
    };

    const handleDeleteImage = (imageId: string) => {
        if (editingProperty && editingProperty.images) {
            // Mark image for deletion (don't delete immediately)
            setImagesToDelete((prev) => [...prev, imageId]);

            // Remove from UI immediately for better UX
            const updatedImages = editingProperty.images.filter(
                (img: any) => (img.id || img._id) !== imageId
            );
            setEditingProperty({
                ...editingProperty,
                images: updatedImages,
            });

            toast({
                title: "Image marked for deletion",
                description: "The image will be deleted when you click Update",
            });
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-medium">Property Images</h3>
                <p className="text-sm text-gray-600">
                    Manage the images associated with this property. Drag to reorder.
                </p>
            </div>

            {editingProperty && editingProperty.images && editingProperty.images.length > 0 ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Property Images</h4>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddMoreImages}
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add More Images
                        </Button>
                    </div>
                    <div
                        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${isDragOver
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-transparent'
                            }`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {isDragOver && (
                            <div className="flex flex-col items-center py-8">
                                <Upload className="w-8 h-8 text-blue-500 mb-2" />
                                <p className="text-blue-600 font-medium">Drop images here to add them</p>
                            </div>
                        )}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={editingProperty.images.map((img: any) => img.id || img._id)}
                                strategy={rectSortingStrategy}
                            >
                                <div className="grid grid-cols-3 gap-4">
                                    {editingProperty.images.map((image: any, index: number) => (
                                        <SortableImageItem
                                            key={image.id || image._id}
                                            image={image}
                                            index={index}
                                            onSetPrimary={() => handleSetPrimary(image.id || image._id)}
                                            onDelete={() => handleDeleteImage(image.id || image._id)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>

                    {/* Show pending images in edit mode */}
                    {pendingImages.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                            <h4 className="text-sm font-medium mb-2">Pending Uploads</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {pendingImages.map((file, index) => (
                                    <div
                                        key={index}
                                        className="aspect-square relative bg-gray-100 rounded-lg flex items-center justify-center"
                                    >
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            alt={`Pending image ${index + 1}`}
                                            width={60}
                                            height={60}
                                            className="object-cover rounded w-full h-full ring-2 ring-blue-500"
                                        />

                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="default"
                                            className="absolute top-0 right-0 gap-2"
                                            onClick={() => {
                                                setPendingImages((prev) =>
                                                    prev.filter((img) => img !== file)
                                                );
                                            }}
                                        >
                                            <XIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-blue-600 mt-2">
                                {pendingImages.length} image(s) will be uploaded when you click Update
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {pendingImages.length > 0 ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                                {pendingImages.map((file, index) => (
                                    <div
                                        key={index}
                                        className="aspect-square relative bg-gray-100 rounded-lg flex items-center justify-center"
                                    >
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            alt={`Pending image ${index + 1}`}
                                            width={60}
                                            height={60}
                                            className="object-cover rounded w-full h-full ring-2"
                                        />

                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="default"
                                            className="absolute top-0 right-0 gap-2"
                                            onClick={() => {
                                                setPendingImages((prev) =>
                                                    prev.filter((img) => img !== file)
                                                );
                                            }}
                                        >
                                            <XIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600">
                                {pendingImages.length} image(s) ready to upload
                            </p>
                        </div>
                    ) : (
                        <>
                            {isDragOver ? (
                                <div className="flex flex-col items-center">
                                    <Upload className="w-12 h-12 text-blue-500 mb-4" />
                                    <p className="text-blue-600 font-medium mb-2">Drop images here</p>
                                    <p className="text-sm text-blue-500">Release to upload</p>
                                </div>
                            ) : (
                                <>
                                    <Image
                                        src="/assets/images/placeholder-image.svg"
                                        alt="No images"
                                        width={64}
                                        height={64}
                                        className="mx-auto mb-4 opacity-50"
                                    />
                                    <p className="text-gray-500 mb-2">No images uploaded yet</p>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Drag and drop images here or click to browse
                                    </p>
                                </>
                            )}
                        </>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleUploadImages}
                        className="mt-4"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        {pendingImages.length > 0 ? 'Add More Images' : 'Upload Images'}
                    </Button>
                </div>
            )}
        </div>
    );
};

