/**
 * 素材引用管理器
 * 
 * 管理节目编辑器中的素材引用，包括：
 * - 素材列表获取和缓存
 * - 素材引用验证
 * - 素材上传管理
 * - 素材分类管理
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  MaterialInfo,
  MaterialReference,
  MaterialCategory,
  MaterialRefValidationResult,
  MaterialRefsBatchValidationResult,
  ItemType,
  MaterialStatus,
  ApiResponse,
  PaginationParams
} from '../types';
import MaterialAPI, { ListMaterialResponse } from '@/lib/api/material';
import FileUploadAPI from '@/lib/api/fileUpload';

/**
 * 素材查询参数
 */
interface MaterialQuery extends PaginationParams {
  category?: string;
  type?: ItemType;
  search?: string;
  tags?: string[];
  status?: MaterialStatus;
}

/**
 * 素材上传进度
 */
interface UploadProgress {
  materialId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

/**
 * 素材引用管理状态接口
 */
interface MaterialRefStore {
  // 状态数据
  materials: Record<string, MaterialInfo>; // 素材缓存
  categories: MaterialCategory[];
  selectedCategory: string | null;
  
  // 查询状态
  currentQuery: MaterialQuery;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  
  // 上传状态
  uploads: Record<string, UploadProgress>;
  
  // 缓存管理
  cacheTimestamp: Record<string, number>; // 缓存时间戳
  cacheExpiry: number; // 缓存过期时间（毫秒）
  
  // 操作方法 - 素材查询
  loadMaterials: (query?: Partial<MaterialQuery>) => Promise<void>;
  loadMaterialDetails: (materialId: string) => Promise<MaterialInfo | null>;
  searchMaterials: (keyword: string) => Promise<void>;
  filterByCategory: (category: string | null) => Promise<void>;
  filterByType: (type: ItemType | null) => Promise<void>;
  
  // 操作方法 - 分类管理
  loadCategories: () => Promise<void>;
  setSelectedCategory: (category: string | null) => void;
  
  // 操作方法 - 素材上传
  uploadMaterial: (file: File, options?: {
    name?: string;
    category?: string;
    tags?: string[];
    description?: string;
  }) => Promise<string>; // 返回materialId
  
  cancelUpload: (materialId: string) => void;
  retryUpload: (materialId: string) => Promise<void>;
  clearCompletedUploads: () => void;
  
  // 操作方法 - 素材引用验证
  validateMaterialRef: (materialRef: MaterialReference) => Promise<MaterialRefValidationResult>;
  validateMaterialRefs: (materialRefs: MaterialReference[]) => Promise<MaterialRefsBatchValidationResult>;
  
  // 操作方法 - 缓存管理
  getCachedMaterial: (materialId: string) => MaterialInfo | null;
  setCachedMaterial: (material: MaterialInfo) => void;
  clearCache: () => void;
  clearExpiredCache: () => void;
  
  // 操作方法 - 工具函数
  getMaterialsByCategory: (category: string) => MaterialInfo[];
  getMaterialsByType: (type: ItemType) => MaterialInfo[];
  createMaterialReference: (material: MaterialInfo) => MaterialReference;
  
  // 操作方法 - 状态管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * 默认查询参数
 */
const DEFAULT_QUERY: MaterialQuery = {
  page: 1,
  pageSize: 20,
  sortBy: 'updatedAt',
  sortOrder: 'desc'
};

/**
 * API调用函数（这些需要根据实际后端接口实现）
 */
const mapToMaterialInfo = (m: ListMaterialResponse): MaterialInfo => {
  const lower = m.fileExtension?.toLowerCase() || '';
  const isImage = ['jpg','jpeg','png','bmp','webp','gif'].includes(lower);
  const isVideo = ['mp4','avi','mov','mkv','flv','wmv','m4v'].includes(lower);
  const category: MaterialCategory = isImage ? 'image' : isVideo ? 'video' : 'other';
  const type: ItemType = isImage ? ItemType.IMAGE : isVideo ? ItemType.VIDEO : ItemType.DOC;
  // 预览URL（若服务未提供该接口，图片会走占位渲染，不影响拖拽使用）
  const accessUrl = isImage ? `/file/api/file/preview/${m.fileId}` : '';
  return {
    id: String(m.mid),
    name: m.materialName,
    type,
    category,
    filePath: '',
    accessUrl,
    md5Hash: '',
    originName: m.materialName,
    fileSize: m.fileSize,
    metadata: {
      format: lower.toUpperCase(),
      dimensions: undefined,
      duration: undefined
    },
    createdAt: m.createTime,
    updatedAt: m.updateTime,
    createdBy: String(m.uploadedBy),
    tags: [],
    description: m.description,
    status: m.fileStatus === 0 ? MaterialStatus.READY : (m.fileStatus === 1 ? MaterialStatus.PROCESSING : MaterialStatus.ERROR),
    processingProgress: m.processProgress,
    errorMessage: m.fileStatus === 2 ? m.fileStatusDesc : undefined
  };
};

const materialApi = {
  // 获取素材列表（整库）
  async getMaterials(query: MaterialQuery): Promise<ApiResponse<{ items: MaterialInfo[]; categories: MaterialCategory[] }>> {
    try {
      const list = await MaterialAPI.listAllMaterials();
      const items = list.map(mapToMaterialInfo);
      return {
        success: true,
        data: { items, categories: [] },
        meta: { total: items.length, page: query.page || 1, pageSize: query.pageSize || 20, timestamp: new Date().toISOString() }
      };
    } catch (e:any) {
      return { success: false, error: { code: 'ERR_MATERIAL_LIST', message: e?.message || '加载素材失败' }, meta: { timestamp: new Date().toISOString() } } as any;
    }
  },
  // 获取素材详情（暂未实现，留空）
  async getMaterialDetails(materialId: string): Promise<ApiResponse<MaterialInfo>> {
    return { success: false, error: { code: 'ERR_NOT_IMPLEMENTED', message: '未实现' }, meta: { timestamp: new Date().toISOString() } } as any;
  },
  // 获取分类列表（暂使用静态）
  async getCategories(): Promise<ApiResponse<MaterialCategory[]>> {
    return { success: true, data: [], meta: { timestamp: new Date().toISOString() } };
  },
  // 上传素材（调用文件服务）
  async uploadMaterial(file: File, options: any): Promise<ApiResponse<{ materialId: string }>> {
    await FileUploadAPI.uploadSingleFile(file, { folderId: '', materialName: options?.name || file.name, description: options?.description });
    return { success: true, data: { materialId: `unknown_${Date.now()}` }, meta: { timestamp: new Date().toISOString() } };
  },
  // 验证素材引用（直接返回有效）
  async validateMaterialRefs(materialRefs: MaterialReference[]): Promise<ApiResponse<MaterialRefsBatchValidationResult>> {
    return {
      success: true,
      data: {
        results: materialRefs.map(ref => ({ materialId: ref.materialId, isValid: true })),
        validCount: materialRefs.length,
        invalidCount: 0
      },
      meta: { timestamp: new Date().toISOString() }
    };
  }
};

/**
 * 创建素材引用管理store
 */
export const useMaterialStore = create<MaterialRefStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // 初始状态
        materials: {},
        categories: [],
        selectedCategory: null,
        
        currentQuery: { ...DEFAULT_QUERY },
        totalCount: 0,
        isLoading: false,
        error: null,
        
        uploads: {},
        
        cacheTimestamp: {},
        cacheExpiry: 30 * 60 * 1000, // 30分钟缓存
        
        // 素材查询方法
        loadMaterials: async (query = {}) => {
          const newQuery = { ...get().currentQuery, ...query };
          
          set((state) => {
            state.currentQuery = newQuery;
            state.isLoading = true;
            state.error = null;
          });
          
          try {
            const response = await materialApi.getMaterials(newQuery);
            
            if (response.success && response.data) {
              set((state) => {
                // 更新素材缓存
                response.data.items.forEach(material => {
                  state.materials[material.id] = material;
                  state.cacheTimestamp[material.id] = Date.now();
                });
                
                // 更新分类
                if (response.data.categories) {
                  state.categories = response.data.categories;
                }
                
                // 更新查询状态
                state.totalCount = response.meta?.total || 0;
                state.isLoading = false;
              });
            } else {
              set((state) => {
                state.error = response.error?.message || '加载素材失败';
                state.isLoading = false;
              });
            }
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : '网络错误';
              state.isLoading = false;
            });
          }
        },
        
        loadMaterialDetails: async (materialId) => {
          // 先检查缓存
          const cached = get().getCachedMaterial(materialId);
          if (cached) {
            return cached;
          }
          
          try {
            const response = await materialApi.getMaterialDetails(materialId);
            
            if (response.success && response.data) {
              set((state) => {
                state.materials[materialId] = response.data;
                state.cacheTimestamp[materialId] = Date.now();
              });
              
              return response.data;
            }
          } catch (error) {
            console.error('Failed to load material details:', error);
          }
          
          return null;
        },
        
        searchMaterials: async (keyword) => {
          await get().loadMaterials({
            search: keyword,
            page: 1 // 搜索时重置页码
          });
        },
        
        filterByCategory: async (category) => {
          set((state) => {
            state.selectedCategory = category;
          });
          
          await get().loadMaterials({
            category: category || undefined,
            page: 1 // 过滤时重置页码
          });
        },
        
        filterByType: async (type) => {
          await get().loadMaterials({
            type: type || undefined,
            page: 1 // 过滤时重置页码
          });
        },
        
        // 分类管理方法
        loadCategories: async () => {
          try {
            const response = await materialApi.getCategories();
            
            if (response.success && response.data) {
              set((state) => {
                state.categories = response.data;
              });
            }
          } catch (error) {
            console.error('Failed to load categories:', error);
          }
        },
        
        setSelectedCategory: (category) => {
          set((state) => {
            state.selectedCategory = category;
          });
        },
        
        // 素材上传方法
        uploadMaterial: async (file, options = {}) => {
          const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // 初始化上传进度
          set((state) => {
            state.uploads[uploadId] = {
              materialId: uploadId,
              fileName: file.name,
              progress: 0,
              status: 'pending'
            };
          });
          
          try {
            // 开始上传
            set((state) => {
              state.uploads[uploadId].status = 'uploading';
            });
            
            const response = await materialApi.uploadMaterial(file, options);
            
            if (response.success && response.data) {
              const materialId = response.data.materialId;
              
              set((state) => {
                state.uploads[uploadId] = {
                  ...state.uploads[uploadId],
                  materialId,
                  progress: 100,
                  status: 'completed'
                };
              });
              
              // 重新加载素材列表
              await get().loadMaterials();
              
              return materialId;
            } else {
              throw new Error(response.error?.message || '上传失败');
            }
          } catch (error) {
            set((state) => {
              state.uploads[uploadId] = {
                ...state.uploads[uploadId],
                status: 'error',
                error: error instanceof Error ? error.message : '上传失败'
              };
            });
            
            throw error;
          }
        },
        
        cancelUpload: (materialId) => {
          set((state) => {
            if (state.uploads[materialId]) {
              state.uploads[materialId].status = 'error';
              state.uploads[materialId].error = '用户取消';
            }
          });
        },
        
        retryUpload: async (materialId) => {
          const upload = get().uploads[materialId];
          if (upload && upload.status === 'error') {
            // 重置状态并重新上传
            set((state) => {
              state.uploads[materialId] = {
                ...upload,
                progress: 0,
                status: 'pending',
                error: undefined
              };
            });
            
            // TODO: 实现重新上传逻辑
          }
        },
        
        clearCompletedUploads: () => {
          set((state) => {
            Object.keys(state.uploads).forEach(key => {
              if (state.uploads[key].status === 'completed') {
                delete state.uploads[key];
              }
            });
          });
        },
        
        // 素材引用验证方法
        validateMaterialRef: async (materialRef) => {
          const result = await get().validateMaterialRefs([materialRef]);
          return result.results[0];
        },
        
        validateMaterialRefs: async (materialRefs) => {
          try {
            const response = await materialApi.validateMaterialRefs(materialRefs);
            
            if (response.success && response.data) {
              return response.data;
            } else {
              throw new Error(response.error?.message || '验证失败');
            }
          } catch (error) {
            return {
              results: materialRefs.map(ref => ({
                materialId: ref.materialId,
                isValid: false,
                error: error instanceof Error ? error.message : '验证失败'
              })),
              validCount: 0,
              invalidCount: materialRefs.length
            };
          }
        },
        
        // 缓存管理方法
        getCachedMaterial: (materialId) => {
          const state = get();
          const material = state.materials[materialId];
          const timestamp = state.cacheTimestamp[materialId];
          
          if (material && timestamp && (Date.now() - timestamp) < state.cacheExpiry) {
            return material;
          }
          
          return null;
        },
        
        setCachedMaterial: (material) => {
          set((state) => {
            state.materials[material.id] = material;
            state.cacheTimestamp[material.id] = Date.now();
          });
        },
        
        clearCache: () => {
          set((state) => {
            state.materials = {};
            state.cacheTimestamp = {};
          });
        },
        
        clearExpiredCache: () => {
          set((state) => {
            const now = Date.now();
            Object.keys(state.cacheTimestamp).forEach(materialId => {
              if ((now - state.cacheTimestamp[materialId]) >= state.cacheExpiry) {
                delete state.materials[materialId];
                delete state.cacheTimestamp[materialId];
              }
            });
          });
        },
        
        // 工具函数
        getMaterialsByCategory: (category) => {
          const materials = Object.values(get().materials);
          return materials.filter(material => material.category === category);
        },
        
        getMaterialsByType: (type) => {
          const materials = Object.values(get().materials);
          return materials.filter(material => material.type === type);
        },
        
        createMaterialReference: (material) => {
          return {
            materialId: material.id,
            materialName: material.name,
            materialType: material.type,
            category: material.category,
            filePath: material.filePath,
            accessUrl: material.accessUrl,
            md5Hash: material.md5Hash,
            originName: material.originName,
            fileSize: material.fileSize,
            dimensions: material.metadata.dimensions,
            duration: material.metadata.duration,
            format: material.metadata.format,
            isRelative: material.filePath.startsWith('./') || material.filePath.startsWith('../'),
            convertPath: undefined
          };
        },
        
        // 状态管理方法
        setLoading: (loading) => {
          set((state) => {
            state.isLoading = loading;
          });
        },
        
        setError: (error) => {
          set((state) => {
            state.error = error;
          });
        },
        
        reset: () => {
          set((state) => {
            state.materials = {};
            state.categories = [];
            state.selectedCategory = null;
            state.currentQuery = { ...DEFAULT_QUERY };
            state.totalCount = 0;
            state.isLoading = false;
            state.error = null;
            state.uploads = {};
            state.cacheTimestamp = {};
          });
        }
      })),
      {
        name: 'material-store', // 用于devtools
      }
    )
  )
);

// 导出状态选择器（返回稳定引用，避免返回新数组导致无限循环）
export const useMaterialsMap = () => useMaterialStore(state => state.materials);
export const useSelectedCategory = () => useMaterialStore(state => state.selectedCategory);
export const useMaterialCategories = () => useMaterialStore(state => state.categories);
export const useMaterialLoading = () => useMaterialStore(state => state.isLoading);
export const useMaterialError = () => useMaterialStore(state => state.error);
export const useUploadProgress = () => useMaterialStore(state => state.uploads);