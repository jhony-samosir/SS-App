"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Loader2, 
  Settings2,
  Tags,
  Trash2, 
  Hash,
  Filter,
  CheckCircle2,
  Circle,
  Edit3
} from "lucide-react";
import { catalogService } from "@/services/catalog-service";
import { ProductAttribute, Tag } from "@/types/catalog";
import { DataTable } from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AttributeFormModal } from "./AttributeFormModal";
import { TagFormModal } from "./TagFormModal";

export function AttributesManagement() {
  const queryClient = useQueryClient();
  
  // State
  const [activeTab, setActiveTab] = useState<"attributes" | "tags">("attributes");
  
  // Attribute State
  const [attrPage, setAttrPage] = useState(1);
  const [attrLimit] = useState(10);
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [selectedAttr, setSelectedAttr] = useState<ProductAttribute | null>(null);

  // Tag State
  const [tagPage, setTagPage] = useState(1);
  const [tagLimit] = useState(10);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  // Queries
  const { data: attrData, isLoading: isLoadingAttrs } = useQuery({
    queryKey: ["admin-attributes", attrPage, attrLimit],
    queryFn: () => catalogService.getAttributes({ page: attrPage, limit: attrLimit }),
    enabled: activeTab === "attributes"
  });

  const { data: tagData, isLoading: isLoadingTags } = useQuery({
    queryKey: ["admin-tags", tagPage, tagLimit],
    queryFn: () => catalogService.getTags({ page: tagPage, limit: tagLimit }),
    enabled: activeTab === "tags"
  });

  const createAttrMutation = useMutation({
    mutationFn: (newAttr: Partial<ProductAttribute>) => catalogService.createAttribute(newAttr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-attributes"] });
      toast.success("Attribute created successfully");
      setIsAttrModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create attribute");
    }
  });

  const updateAttrMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<ProductAttribute> }) => 
      catalogService.updateAttribute(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-attributes"] });
      const previousData = queryClient.getQueryData(["admin-attributes", attrPage, attrLimit]);
      
      queryClient.setQueryData(["admin-attributes", attrPage, attrLimit], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.map((item: ProductAttribute) => 
              item.id === id ? { ...item, ...data } : item
            )
          }
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["admin-attributes", attrPage, attrLimit], context?.previousData);
      toast.error("Failed to update attribute");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-attributes"] });
      toast.success("Attribute updated successfully");
      setIsAttrModalOpen(false);
    }
  });

  const deleteAttrMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteAttribute(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["admin-attributes"] });
      const previousData = queryClient.getQueryData(["admin-attributes", attrPage, attrLimit]);

      queryClient.setQueryData(["admin-attributes", attrPage, attrLimit], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.filter((item: ProductAttribute) => item.id !== id),
            total_count: old.data.total_count - 1
          }
        };
      });

      return { previousData };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["admin-attributes", attrPage, attrLimit], context?.previousData);
      toast.error("Failed to delete attribute");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-attributes"] });
      toast.success("Attribute deleted successfully");
    }
  });

  // --- Tag Mutations ---
  const createTagMutation = useMutation({
    mutationFn: (newTag: Partial<Tag>) => catalogService.createTag(newTag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      toast.success("Tag created successfully");
      setIsTagModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create tag");
    }
  });

  const updateTagMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Tag> }) => 
      catalogService.updateTag(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-tags"] });
      const previousData = queryClient.getQueryData(["admin-tags", tagPage, tagLimit]);
      
      queryClient.setQueryData(["admin-tags", tagPage, tagLimit], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.map((item: Tag) => 
              item.id === id ? { ...item, ...data } : item
            )
          }
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["admin-tags", tagPage, tagLimit], context?.previousData);
      toast.error("Failed to update tag");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      toast.success("Tag updated successfully");
      setIsTagModalOpen(false);
    }
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteTag(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["admin-tags"] });
      const previousData = queryClient.getQueryData(["admin-tags", tagPage, tagLimit]);

      queryClient.setQueryData(["admin-tags", tagPage, tagLimit], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.filter((item: Tag) => item.id !== id),
            total_count: old.data.total_count - 1
          }
        };
      });

      return { previousData };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["admin-tags", tagPage, tagLimit], context?.previousData);
      toast.error("Failed to delete tag");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      toast.success("Tag deleted successfully");
    }
  });

  const handleAttrSubmit = (values: any) => {
    if (selectedAttr) {
      updateAttrMutation.mutate({ id: selectedAttr.id, data: values });
    } else {
      createAttrMutation.mutate(values);
    }
  };

  const handleTagSubmit = (values: any) => {
    if (selectedTag) {
      updateTagMutation.mutate({ id: selectedTag.id, data: values });
    } else {
      createTagMutation.mutate(values);
    }
  };

  const attributes = attrData?.data?.items || [];
  const totalAttrCount = attrData?.data?.total_count || 0;

  const attributeColumns = [
    {
      header: "Attribute",
      render: (attr: ProductAttribute) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{attr.name}</span>
          <span className="text-xs text-muted-foreground font-mono">{attr.code}</span>
        </div>
      ),
    },
    {
      header: "Input Type",
      render: (attr: ProductAttribute) => (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-secondary/10 text-secondary border border-secondary/20">
          {attr.input_type}
        </span>
      ),
    },
    {
      header: "Variant?",
      render: (attr: ProductAttribute) => (
        <div className={cn(
          "flex items-center gap-1.5 text-xs font-medium",
          attr.is_variant ? "text-emerald-600" : "text-muted-foreground"
        )}>
          {attr.is_variant ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          {attr.is_variant ? "Variant Enabled" : "Static Only"}
        </div>
      ),
    },
    {
      header: "Values",
      render: (attr: ProductAttribute) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {attr.values?.map((v, idx) => (
            <span key={idx} className="px-1.5 py-0.5 bg-muted rounded text-[10px] border border-border">
              {v.value}
            </span>
          )) || <span className="text-xs italic text-muted-foreground">No values</span>}
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (attr: ProductAttribute) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => {
              setSelectedAttr(attr);
              setIsAttrModalOpen(true);
            }}
            className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
            title="Edit Attribute"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={() => {
              if (confirm("Are you sure you want to delete this attribute?")) {
                deleteAttrMutation.mutate(attr.id);
              }
            }}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const tagColumns = [
    {
      header: "Tag Name",
      render: (tag: Tag) => (
        <div className="flex items-center gap-2">
          <Hash size={16} className="text-muted-foreground" />
          <span className="font-bold">{tag.name}</span>
        </div>
      ),
    },
    {
      header: "Slug",
      render: (tag: Tag) => (
        <span className="text-sm font-mono text-muted-foreground">{tag.slug}</span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (tag: Tag) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => {
              setSelectedTag(tag);
              setIsTagModalOpen(true);
            }}
            className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
            title="Edit Tag"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={() => {
              if (confirm("Delete this tag?")) {
                deleteTagMutation.mutate(tag.id);
              }
            }}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 bg-muted/30 p-1 rounded-2xl border border-border/50">
          <button
            onClick={() => setActiveTab("attributes")}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all",
              activeTab === "attributes" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Settings2 size={18} />
            Attributes
          </button>
          <button
            onClick={() => setActiveTab("tags")}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all",
              activeTab === "tags" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Tags size={18} />
            Tags
          </button>
        </div>

        <button
          onClick={() => {
            if (activeTab === "attributes") {
              setSelectedAttr(null);
              setIsAttrModalOpen(true);
            } else {
              setSelectedTag(null);
              setIsTagModalOpen(true);
            }
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          {activeTab === "attributes" ? "New Attribute" : "New Tag"}
        </button>
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
        {activeTab === "attributes" ? (
          <DataTable
            columns={attributeColumns}
            data={attributes}
            isLoading={isLoadingAttrs}
            page={attrPage}
            onPageChange={setAttrPage}
            pageSize={attrLimit}
            totalCount={totalAttrCount}
          />
        ) : (
          <DataTable
            columns={tagColumns}
            data={tagData?.data?.items || []}
            isLoading={isLoadingTags}
            page={tagPage}
            onPageChange={setTagPage}
            pageSize={tagLimit}
            totalCount={tagData?.data?.total_count || 0}
          />
        )}
      </div>

      <AttributeFormModal
        isOpen={isAttrModalOpen}
        onClose={() => setIsAttrModalOpen(false)}
        onSubmit={handleAttrSubmit}
        initialData={selectedAttr}
        isLoading={createAttrMutation.isPending || updateAttrMutation.isPending}
      />

      <TagFormModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onSubmit={handleTagSubmit}
        initialData={selectedTag}
        isLoading={createTagMutation.isPending || updateTagMutation.isPending}
      />
    </div>
  );
}
