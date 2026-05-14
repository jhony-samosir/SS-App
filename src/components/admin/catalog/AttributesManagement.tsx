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

export function AttributesManagement() {
  const queryClient = useQueryClient();
  
  // State
  const [activeTab, setActiveTab] = useState<"attributes" | "tags">("attributes");
  const [attrPage, setAttrPage] = useState(1);
  const [attrLimit] = useState(10);
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [selectedAttr, setSelectedAttr] = useState<ProductAttribute | null>(null);

  // Queries
  const { data: attrData, isLoading: isLoadingAttrs } = useQuery({
    queryKey: ["admin-attributes", attrPage, attrLimit],
    queryFn: () => catalogService.getAttributes({ page: attrPage, limit: attrLimit }),
    enabled: activeTab === "attributes"
  });

  const { data: tags, isLoading: isLoadingTags } = useQuery({
    queryKey: ["admin-tags"],
    queryFn: () => catalogService.getTags(),
    enabled: activeTab === "tags"
  });

  // Mutations
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

  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteTag(id),
    onSuccess: () => {
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
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Attributes & Tags</h1>
          <p className="text-muted-foreground">Define global product characteristics and discovery labels</p>
        </div>

        <div className="flex bg-muted p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab("attributes")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "attributes" ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Settings2 size={18} />
            Attributes
          </button>
          <button 
            onClick={() => setActiveTab("tags")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "tags" ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Tags size={18} />
            Tags
          </button>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            {activeTab === "attributes" ? <Filter size={20} /> : <Hash size={20} />}
            {activeTab === "attributes" ? "Global Attributes" : "Discovery Tags"}
          </div>

          <button 
            onClick={() => {
              if (activeTab === "attributes") {
                setSelectedAttr(null);
                setIsAttrModalOpen(true);
              }
            }}
            className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
          >
            <Plus size={16} />
            {activeTab === "attributes" ? "New Attribute" : "Create Tag"}
          </button>
        </div>

        {activeTab === "attributes" ? (
          <DataTable 
            columns={attributeColumns} 
            data={attributes} 
            isLoading={isLoadingAttrs} 
            emptyMessage="No attributes defined"
            page={attrPage}
            onPageChange={setAttrPage}
            totalCount={totalAttrCount}
            pageSize={attrLimit}
          />
        ) : (
          <DataTable 
            columns={tagColumns} 
            data={tags?.data} 
            isLoading={isLoadingTags} 
            emptyMessage="No tags found"
            page={1}
            onPageChange={() => {}}
            totalCount={tags?.data?.length || 0}
          />
        )}
      </div>

      <AttributeFormModal
        isOpen={isAttrModalOpen}
        onClose={() => setIsAttrModalOpen(false)}
        onSubmit={handleAttrSubmit}
        initialData={selectedAttr}
        isLoading={createAttrMutation.isPending}
      />
    </div>
  );
}
