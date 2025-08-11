/**
 * 重新设计的节目编辑器状态管理
 * 使用Zustand实现简化的状态管理，专注于LED显示屏内容编辑
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  EditorState, 
  EditorItem, 
  EditorRegion, 
  EditorPage, 
  ProgramInfo,
  EditorTool,
  EditorOperation,
  Position,
  Dimensions,
  Rectangle,
  ValidationResult,
  VSNItemType
} from '../types/program-editor';

// ============================================================================
// 状态接口定义
// ============================================================================

interface EditorStore extends EditorState {
  // 基础操作
  setProgram: (program: Partial<ProgramInfo>) => void;
  updateProgramResolution: (resolution: Dimensions) => void;
  setCurrentPage: (pageIndex: number) => void;
  setSelectedItems: (itemIds: string[]) => void;
  setSelectedRegions: (regionIds: string[]) => void;
  setTool: (tool: EditorTool) => void;
  setZoomLevel: (zoom: number) => void;
  setPreviewMode: (enabled: boolean) => void;
  setShowOnlyActiveItem: (enabled: boolean) => void;
  setActiveItemIndex: (regionId: string, index: number) => void;

  // 页面操作
  addPage: (page?: Partial<EditorPage>) => void;
  duplicatePage: (pageIndex: number) => void;
  deletePage: (pageIndex: number) => void;
  movePage: (fromIndex: number, toIndex: number) => void;
  updatePage: (pageIndex: number, updates: Partial<EditorPage>) => void;

  // 区域操作
  addRegion: (pageIndex: number, region?: Partial<EditorRegion>) => void;
  updateRegion: (pageIndex: number, regionId: string, updates: Partial<EditorRegion>) => void;
  deleteRegion: (pageIndex: number, regionId: string) => void;
  resizeRegion: (pageIndex: number, regionId: string, bounds: Rectangle) => void;

  // 项目操作
  addItem: (pageIndex: number, regionId: string, item: Partial<EditorItem>) => void;
  updateItem: (pageIndex: number, regionId: string, itemId: string, updates: Partial<EditorItem>) => void;
  deleteItem: (pageIndex: number, regionId: string, itemId: string) => void;
  moveItem: (pageIndex: number, fromRegionId: string, toRegionId: string, itemId: string) => void;
  duplicateItem: (pageIndex: number, regionId: string, itemId: string) => void;
  reorderItems: (pageIndex: number, regionId: string, itemIds: string[]) => void;

  // 变换操作
  moveItems: (itemUpdates: Array<{ pageIndex: number; regionId: string; itemId: string; position: Position }>) => void;
  resizeItems: (itemUpdates: Array<{ pageIndex: number; regionId: string; itemId: string; dimensions: Dimensions }>) => void;
  rotateItems: (itemUpdates: Array<{ pageIndex: number; regionId: string; itemId: string; rotation: number }>) => void;

  // 剪贴板操作
  copyItems: (pageIndex: number, regionId: string, itemIds: string[]) => void;
  cutItems: (pageIndex: number, regionId: string, itemIds: string[]) => void;
  pasteItems: (pageIndex: number, regionId: string, position?: Position) => void;

  // 历史操作
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: (description: string) => void;

  // 验证和保存
  validate: () => ValidationResult;
  markDirty: () => void;
  markClean: () => void;
  
  // 实用工具
  findItem: (itemId: string) => { pageIndex: number; regionId: string; item: EditorItem } | null;
  findRegion: (regionId: string) => { pageIndex: number; region: EditorRegion } | null;
  getCurrentPage: () => EditorPage | null;
  getSelectedItems: () => EditorItem[];
  getSelectedRegions: () => EditorRegion[];
}

// ============================================================================
// 默认值和工具函数
// ============================================================================

const createDefaultProgram = (): ProgramInfo => ({
  name: '未命名节目',
  description: '',
  width: 1920,
  height: 1080,
});

const createDefaultPage = (name?: string): EditorPage => ({
  id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: name || `页面${Date.now()}`,
  duration: { milliseconds: 10000 },
  autoLoop: false,
  backgroundColor: { value: '#000000' },
  regions: [],
});

const createDefaultRegion = (bounds?: Rectangle, name?: string): EditorRegion => ({
  id: `region_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: name || `区域${Date.now()}`,
  bounds: bounds || { x: 0, y: 0, width: 1920, height: 1080 },
  borderWidth: 0,
  borderColor: { value: '#ffffff' },
  items: [],
  zIndex: 0,
  visible: true,
  locked: false,
});

const generateItemId = (): string => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createDefaultItem = (type: VSNItemType, position?: Position): Partial<EditorItem> => {
  const baseItem = {
    id: generateItemId(),
    type,
    name: `素材${Date.now()}`,
    position: position || { x: 100, y: 100 },
    dimensions: { width: 200, height: 100 },
    visible: true,
    locked: false,
    zIndex: 0,
  };

  // 根据类型设置特定属性
  switch (type) {
    case 4: // 单行文本
    case 5: // 多行文本
      return {
        ...baseItem,
        content: '文本内容',
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: { value: '#ffffff' },
        textAlign: 'left',
      };
    case 9: // 时钟
      return {
        ...baseItem,
        clockType: 'digital',
        timeFormat: '24h',
        showDate: true,
        showSeconds: true,
        fontSize: 24,
        color: { value: '#ffffff' },
      };
    default:
      return baseItem;
  }
};

// ============================================================================
// Zustand Store 实现
// ============================================================================

export const useEditorStore = create<EditorStore>()(
  devtools(
    immer((set, get) => ({
      // 初始状态
      program: createDefaultProgram(),
      pages: [createDefaultPage('首页')],
      currentPageIndex: 0,
      selectedItems: [],
      selectedRegions: [],
      clipboard: [],
      history: [],
      historyIndex: -1,
      isDirty: false,
      isPreviewMode: false,
      zoomLevel: 1,
      showOnlyActiveItem: true,
      activeItemIndexByRegion: {},

      // 基础操作
      setProgram: (updates) =>
        set((state) => {
          Object.assign(state.program, updates);
          state.isDirty = true;
        }),

      updateProgramResolution: (resolution) =>
        set((state) => {
          if (state.program) {
            const oldWidth = state.program.width;
            const oldHeight = state.program.height;
            
            state.program.width = resolution.width;
            state.program.height = resolution.height;
            
            // 更新所有页面的默认区域大小
            state.pages.forEach(page => {
              page.regions.forEach(region => {
                if (region.bounds.x === 0 && region.bounds.y === 0 && 
                    region.bounds.width === oldWidth && 
                    region.bounds.height === oldHeight) {
                  // 如果是全屏区域，更新为新的分辨率
                  region.bounds.width = resolution.width;
                  region.bounds.height = resolution.height;
                }
              });
            });
            
            state.isDirty = true;
          }
        }),

      setCurrentPage: (pageIndex) =>
        set((state) => {
          if (pageIndex >= 0 && pageIndex < state.pages.length) {
            state.currentPageIndex = pageIndex;
            state.selectedItems = [];
            state.selectedRegions = [];
          }
        }),

      setSelectedItems: (itemIds) =>
        set((state) => {
          state.selectedItems = itemIds;
        }),

      setSelectedRegions: (regionIds) =>
        set((state) => {
          state.selectedRegions = regionIds;
        }),

      setTool: (tool) =>
        set((state) => {
          // 工具切换时清除选择
          if (tool !== 'select') {
            state.selectedItems = [];
            state.selectedRegions = [];
          }
        }),

      setZoomLevel: (zoom) =>
        set((state) => {
          state.zoomLevel = Math.max(0.1, Math.min(5, zoom));
        }),

      setPreviewMode: (enabled) =>
        set((state) => {
          state.isPreviewMode = enabled;
          if (enabled) {
            state.selectedItems = [];
            state.selectedRegions = [];
          }
        }),

      setShowOnlyActiveItem: (enabled) =>
        set((state) => {
          state.showOnlyActiveItem = enabled;
        }),

      setActiveItemIndex: (regionId, index) =>
        set((state) => {
          const map = state.activeItemIndexByRegion || {};
          map[regionId] = Math.max(0, index);
          state.activeItemIndexByRegion = { ...map };
        }),

      // 页面操作
      addPage: (pageData) =>
        set((state) => {
          const newPage = { ...createDefaultPage(), ...pageData };
          state.pages.push(newPage);
          state.currentPageIndex = state.pages.length - 1;
          state.isDirty = true;
        }),

      duplicatePage: (pageIndex) =>
        set((state) => {
          if (pageIndex >= 0 && pageIndex < state.pages.length) {
            const originalPage = state.pages[pageIndex];
            const duplicatedPage: EditorPage = {
              ...originalPage,
              id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: `${originalPage.name} 副本`,
              regions: originalPage.regions.map(region => ({
                ...region,
                id: `region_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                items: region.items.map(item => ({
                  ...item,
                  id: generateItemId(),
                })),
              })),
            };
            state.pages.splice(pageIndex + 1, 0, duplicatedPage);
            state.currentPageIndex = pageIndex + 1;
            state.isDirty = true;
          }
        }),

      deletePage: (pageIndex) =>
        set((state) => {
          if (state.pages.length > 1 && pageIndex >= 0 && pageIndex < state.pages.length) {
            state.pages.splice(pageIndex, 1);
            if (state.currentPageIndex >= pageIndex && state.currentPageIndex > 0) {
              state.currentPageIndex--;
            }
            state.isDirty = true;
          }
        }),

      movePage: (fromIndex, toIndex) =>
        set((state) => {
          if (fromIndex !== toIndex && 
              fromIndex >= 0 && fromIndex < state.pages.length &&
              toIndex >= 0 && toIndex < state.pages.length) {
            const [movedPage] = state.pages.splice(fromIndex, 1);
            state.pages.splice(toIndex, 0, movedPage);
            if (state.currentPageIndex === fromIndex) {
              state.currentPageIndex = toIndex;
            } else if (state.currentPageIndex > fromIndex && state.currentPageIndex <= toIndex) {
              state.currentPageIndex--;
            } else if (state.currentPageIndex < fromIndex && state.currentPageIndex >= toIndex) {
              state.currentPageIndex++;
            }
            state.isDirty = true;
          }
        }),

      updatePage: (pageIndex, updates) =>
        set((state) => {
          if (pageIndex >= 0 && pageIndex < state.pages.length) {
            Object.assign(state.pages[pageIndex], updates);
            state.isDirty = true;
          }
        }),

      // 区域操作
      addRegion: (pageIndex, regionData) =>
        set((state) => {
          if (pageIndex >= 0 && pageIndex < state.pages.length) {
            const page = state.pages[pageIndex];
            const newRegion = { ...createDefaultRegion(), ...regionData };
            page.regions.push(newRegion);
            state.selectedRegions = [newRegion.id];
            state.isDirty = true;
          }
        }),

      updateRegion: (pageIndex, regionId, updates) =>
        set((state) => {
          if (pageIndex >= 0 && pageIndex < state.pages.length) {
            const region = state.pages[pageIndex].regions.find(r => r.id === regionId);
            if (region) {
              Object.assign(region, updates);
              state.isDirty = true;
            }
          }
        }),

      deleteRegion: (pageIndex, regionId) =>
        set((state) => {
          if (pageIndex >= 0 && pageIndex < state.pages.length) {
            const page = state.pages[pageIndex];
            const regionIndex = page.regions.findIndex(r => r.id === regionId);
            if (regionIndex >= 0) {
              page.regions.splice(regionIndex, 1);
              state.selectedRegions = state.selectedRegions.filter(id => id !== regionId);
              state.isDirty = true;
            }
          }
        }),

      resizeRegion: (pageIndex, regionId, bounds) =>
        set((state) => {
          if (pageIndex >= 0 && pageIndex < state.pages.length) {
            const region = state.pages[pageIndex].regions.find(r => r.id === regionId);
            if (region) {
              region.bounds = bounds;
              state.isDirty = true;
            }
          }
        }),

      // 项目操作
      addItem: (pageIndex, regionId, itemData) =>
        set((state) => {
          if (pageIndex >= 0 && pageIndex < state.pages.length) {
            const region = state.pages[pageIndex].regions.find(r => r.id === regionId);
            if (region) {
              const newItem = { ...createDefaultItem(itemData.type || 4), ...itemData } as EditorItem;
              region.items.push(newItem);
              state.selectedItems = [newItem.id];
              state.isDirty = true;
            }
          }
        }),

      updateItem: (pageIndex, regionId, itemId, updates) =>
        set((state) => {
          if (pageIndex >= 0 && pageIndex < state.pages.length) {
            const region = state.pages[pageIndex].regions.find(r => r.id === regionId);
            if (region) {
              const item = region.items.find(i => i.id === itemId);
              if (item) {
                Object.assign(item, updates);
                state.isDirty = true;
              }
            }
          }
        }),

      deleteItem: (pageIndex, regionId, itemId) =>
        set((state) => {
          if (pageIndex >= 0 && pageIndex < state.pages.length) {
            const region = state.pages[pageIndex].regions.find(r => r.id === regionId);
            if (region) {
              const itemIndex = region.items.findIndex(i => i.id === itemId);
              if (itemIndex >= 0) {
                region.items.splice(itemIndex, 1);
                state.selectedItems = state.selectedItems.filter(id => id !== itemId);
                state.isDirty = true;
              }
            }
          }
        }),

      moveItem: (pageIndex, fromRegionId, toRegionId, itemId) =>
        set((state) => {
          if (pageIndex >= 0 && pageIndex < state.pages.length) {
            const page = state.pages[pageIndex];
            const fromRegion = page.regions.find(r => r.id === fromRegionId);
            const toRegion = page.regions.find(r => r.id === toRegionId);
            
            if (fromRegion && toRegion) {
              const itemIndex = fromRegion.items.findIndex(i => i.id === itemId);
              if (itemIndex >= 0) {
                const [item] = fromRegion.items.splice(itemIndex, 1);
                toRegion.items.push(item);
                state.isDirty = true;
              }
            }
          }
        }),

      duplicateItem: (pageIndex, regionId, itemId) =>
        set((state) => {
          if (pageIndex >= 0 && pageIndex < state.pages.length) {
            const region = state.pages[pageIndex].regions.find(r => r.id === regionId);
            if (region) {
              const item = region.items.find(i => i.id === itemId);
              if (item) {
                const duplicatedItem = {
                  ...item,
                  id: generateItemId(),
                  name: `${item.name} 副本`,
                  position: {
                    x: item.position.x + 20,
                    y: item.position.y + 20,
                  },
                };
                region.items.push(duplicatedItem);
                state.selectedItems = [duplicatedItem.id];
                state.isDirty = true;
              }
            }
          }
        }),

      reorderItems: (pageIndex, regionId, itemIds) =>
        set((state) => {
          if (pageIndex >= 0 && pageIndex < state.pages.length) {
            const region = state.pages[pageIndex].regions.find(r => r.id === regionId);
            if (region) {
              const reorderedItems = itemIds.map(id => 
                region.items.find(item => item.id === id)
              ).filter(Boolean) as EditorItem[];
              region.items = reorderedItems;
              state.isDirty = true;
            }
          }
        }),

      // 变换操作
      moveItems: (itemUpdates) =>
        set((state) => {
          itemUpdates.forEach(({ pageIndex, regionId, itemId, position }) => {
            if (pageIndex >= 0 && pageIndex < state.pages.length) {
              const region = state.pages[pageIndex].regions.find(r => r.id === regionId);
              if (region) {
                const item = region.items.find(i => i.id === itemId);
                if (item) {
                  item.position = position;
                }
              }
            }
          });
          if (itemUpdates.length > 0) {
            state.isDirty = true;
          }
        }),

      resizeItems: (itemUpdates) =>
        set((state) => {
          itemUpdates.forEach(({ pageIndex, regionId, itemId, dimensions }) => {
            if (pageIndex >= 0 && pageIndex < state.pages.length) {
              const region = state.pages[pageIndex].regions.find(r => r.id === regionId);
              if (region) {
                const item = region.items.find(i => i.id === itemId);
                if (item) {
                  item.dimensions = dimensions;
                }
              }
            }
          });
          if (itemUpdates.length > 0) {
            state.isDirty = true;
          }
        }),

      rotateItems: (itemUpdates) =>
        set((state) => {
          itemUpdates.forEach(({ pageIndex, regionId, itemId, rotation }) => {
            if (pageIndex >= 0 && pageIndex < state.pages.length) {
              const region = state.pages[pageIndex].regions.find(r => r.id === regionId);
              if (region) {
                const item = region.items.find(i => i.id === itemId);
                if (item) {
                  item.rotation = rotation;
                }
              }
            }
          });
          if (itemUpdates.length > 0) {
            state.isDirty = true;
          }
        }),

      // 剪贴板操作
      copyItems: (pageIndex, regionId, itemIds) =>
        set((state) => {
          if (pageIndex >= 0 && pageIndex < state.pages.length) {
            const region = state.pages[pageIndex].regions.find(r => r.id === regionId);
            if (region) {
              const items = region.items.filter(item => itemIds.includes(item.id));
              state.clipboard = items.map(item => ({ ...item }));
            }
          }
        }),

      cutItems: (pageIndex, regionId, itemIds) =>
        set((state) => {
          if (pageIndex >= 0 && pageIndex < state.pages.length) {
            const region = state.pages[pageIndex].regions.find(r => r.id === regionId);
            if (region) {
              const items = region.items.filter(item => itemIds.includes(item.id));
              state.clipboard = items.map(item => ({ ...item }));
              region.items = region.items.filter(item => !itemIds.includes(item.id));
              state.selectedItems = [];
              state.isDirty = true;
            }
          }
        }),

      pasteItems: (pageIndex, regionId, position) =>
        set((state) => {
          if (pageIndex >= 0 && pageIndex < state.pages.length && state.clipboard.length > 0) {
            const region = state.pages[pageIndex].regions.find(r => r.id === regionId);
            if (region) {
              const pastedItems = state.clipboard.map((item, index) => ({
                ...item,
                id: generateItemId(),
                position: position ? {
                  x: position.x + (index * 20),
                  y: position.y + (index * 20),
                } : {
                  x: item.position.x + 20,
                  y: item.position.y + 20,
                },
              }));
              region.items.push(...pastedItems);
              state.selectedItems = pastedItems.map(item => item.id);
              state.isDirty = true;
            }
          }
        }),

      // 历史操作 (简化实现)
      undo: () => {
        // TODO: 实现撤销功能
      },

      redo: () => {
        // TODO: 实现重做功能
      },

      canUndo: () => false, // TODO: 实现

      canRedo: () => false, // TODO: 实现

      saveToHistory: (description) => {
        // TODO: 实现历史保存
      },

      // 验证
      validate: () => {
        const errors: any[] = [];
        const warnings: any[] = [];
        
        // TODO: 实现完整的VSN验证逻辑
        
        return {
          isValid: errors.length === 0,
          errors,
          warnings,
        };
      },

      markDirty: () =>
        set((state) => {
          state.isDirty = true;
        }),

      markClean: () =>
        set((state) => {
          state.isDirty = false;
        }),

      // 实用工具
      findItem: (itemId) => {
        const state = get();
        for (let pageIndex = 0; pageIndex < state.pages.length; pageIndex++) {
          const page = state.pages[pageIndex];
          for (const region of page.regions) {
            const item = region.items.find(i => i.id === itemId);
            if (item) {
              return { pageIndex, regionId: region.id, item };
            }
          }
        }
        return null;
      },

      findRegion: (regionId) => {
        const state = get();
        for (let pageIndex = 0; pageIndex < state.pages.length; pageIndex++) {
          const page = state.pages[pageIndex];
          const region = page.regions.find(r => r.id === regionId);
          if (region) {
            return { pageIndex, region };
          }
        }
        return null;
      },

      getCurrentPage: () => {
        const state = get();
        return state.pages[state.currentPageIndex] || null;
      },

      getSelectedItems: () => {
        const state = get();
        const items: EditorItem[] = [];
        const currentPage = state.pages[state.currentPageIndex];
        if (currentPage) {
          for (const region of currentPage.regions) {
            for (const item of region.items) {
              if (state.selectedItems.includes(item.id)) {
                items.push(item);
              }
            }
          }
        }
        return items;
      },

      getSelectedRegions: () => {
        const state = get();
        const regions: EditorRegion[] = [];
        const currentPage = state.pages[state.currentPageIndex];
        if (currentPage) {
          for (const region of currentPage.regions) {
            if (state.selectedRegions.includes(region.id)) {
              regions.push(region);
            }
          }
        }
        return regions;
      },
    })),
    {
      name: 'program-editor-store',
    }
  )
);