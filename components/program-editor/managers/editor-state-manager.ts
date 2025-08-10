/**
 * 节目编辑器状态管理
 * 
 * 使用Zustand管理节目编辑的完整状态，包括：
 * - 节目基础信息管理
 * - 页面管理（增删改查、切换）
 * - 区域管理
 * - 素材项管理
 * - 画布状态管理
 * - 撤销/重做功能
 * - 选择状态管理
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  EditorState,
  EditorPage,
  EditorRegion,
  EditorItem,
  CanvasState,
  ProgramInfo,
  ItemType,
  createDefaultProgram,
  createDefaultPage,
  createDefaultRegion,
  DEFAULT_PROGRAM_SIZE
} from '../types';

/**
 * 历史记录项
 */
interface HistoryItem {
  id: string;
  timestamp: number;
  description: string;
  state: EditorState;
}

/**
 * 编辑器状态接口
 */
interface EditorStateStore extends EditorState {
  // 状态管理
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean; // 是否有未保存的更改
  // 画布实例
  canvasInstance: any | null;
  
  // 历史记录
  history: HistoryItem[];
  historyIndex: number;
  maxHistorySize: number;
  
  // 选择状态
  selectedObjectIds: string[];
  activeToolId: string;
  
  // 操作方法 - 节目管理
  createNewProgram: (name?: string) => void;
  updateProgramInfo: (info: Partial<ProgramInfo>) => void;
  loadProgram: (programData: EditorState) => void;
  resetProgram: () => void;
  
  // 操作方法 - 页面管理
  addPage: (page?: Partial<EditorPage>) => string;
  removePage: (pageId: string) => void;
  updatePage: (pageId: string, updates: Partial<EditorPage>) => void;
  duplicatePage: (pageId: string) => string;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  setCurrentPage: (index: number) => void;
  getCurrentPage: () => EditorPage | null;
  
  // 操作方法 - 区域管理
  addRegion: (pageId: string, region?: Partial<EditorRegion>) => string;
  removeRegion: (pageId: string, regionId: string) => void;
  updateRegion: (pageId: string, regionId: string, updates: Partial<EditorRegion>) => void;
  duplicateRegion: (pageId: string, regionId: string) => string;
  
  // 操作方法 - 素材项管理
   addItem: (pageId: string, regionId: string, item: Partial<EditorItem>) => string;
  removeItem: (pageId: string, regionId: string, itemId: string) => void;
  updateItem: (pageId: string, regionId: string, itemId: string, updates: Partial<EditorItem>) => void;
  duplicateItem: (pageId: string, regionId: string, itemId: string) => string;
  // 便捷：通过 itemId 操作
  updateItemProperties: (itemId: string, properties: any) => void;
  updateItemPosition: (itemId: string, position: { x: number; y: number }) => void;
  updateItemSize: (itemId: string, size: { width: number; height: number }) => void;
  duplicateItemById: (itemId: string) => string | null;
  deleteItemById: (itemId: string) => void;
  moveItemUp: (itemId: string) => void;
  moveItemDown: (itemId: string) => void;
  moveItemToTop: (itemId: string) => void;
  moveItemToBottom: (itemId: string) => void;
    // 播放顺序（数组顺序）调整：将某个 item 在其所在 region 的 items 数组内上移/下移
    moveItemEarlier: (itemId: string) => void;
    moveItemLater: (itemId: string) => void;
  moveItem: (fromPageId: string, fromRegionId: string, itemId: string, toPageId: string, toRegionId: string) => void;
  
  // 操作方法 - 画布状态管理
  updateCanvasState: (pageId: string, canvasState: Partial<CanvasState>) => void;
  getCanvasState: (pageId: string) => CanvasState | null;
  setCanvas: (canvas: any | null) => void;
  getCanvas: () => any | null;
  
  // 操作方法 - 选择管理
  selectObjects: (objectIds: string[]) => void;
  setSelectedObjects: (objectIds: string[]) => void;
  addSelectedObject: (objectId: string) => void;
  removeSelectedObject: (objectId: string) => void;
  clearSelection: () => void;
  setActiveTool: (toolId: string) => void;
  
  // 操作方法 - 历史记录
  saveToHistory: (description: string) => void;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  
  // 操作方法 - 工具函数
  findItem: (itemId: string) => { pageId: string; regionId: string; item: EditorItem } | null;
  findRegion: (regionId: string) => { pageId: string; region: EditorRegion } | null;
  findPage: (pageId: string) => EditorPage | null;
  
  // 操作方法 - 状态管理
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  markDirty: () => void;
  markClean: () => void;
}

/**
 * 生成唯一ID
 */
const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 创建默认的编辑器状态
 */
const createDefaultEditorState = (): EditorState => {
  const program = createDefaultProgram();
  const defaultPage = createDefaultPage();
  const defaultRegion = createDefaultRegion();
  
  defaultPage.regions = [defaultRegion];
  
  return {
    program,
    pages: [defaultPage],
    currentPageIndex: 0,
    canvasStates: {}
  };
};

/**
 * 创建编辑器状态管理store
 */
export const useEditorStore = create<EditorStateStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // 初始状态
        ...createDefaultEditorState(),
        
        // 状态管理
        isLoading: false,
        isSaving: false,
        isDirty: false,
        canvasInstance: null,
        
        // 历史记录
        history: [],
        historyIndex: -1,
        maxHistorySize: 50,
        
        // 选择状态
        selectedObjectIds: [],
        activeToolId: 'select',
        
        // 节目管理方法
        createNewProgram: (name = '新建节目') => {
          set((state) => {
            const newState = createDefaultEditorState();
            newState.program.name = name;
            
            Object.assign(state, newState);
            state.isDirty = false;
            state.selectedObjectIds = [];
            state.history = [];
            state.historyIndex = -1;
          });
        },
        
        updateProgramInfo: (info) => {
          set((state) => {
            Object.assign(state.program, info);
            state.isDirty = true;
          });
        },
        
        loadProgram: (programData) => {
          set((state) => {
            Object.assign(state, programData);
            state.isDirty = false;
            state.selectedObjectIds = [];
            state.history = [];
            state.historyIndex = -1;
          });
        },
        
        resetProgram: () => {
          set((state) => {
            const newState = createDefaultEditorState();
            Object.assign(state, newState);
            state.isDirty = false;
            state.selectedObjectIds = [];
            state.history = [];
            state.historyIndex = -1;
          });
        },
        
        // 页面管理方法
        addPage: (pageData = {}) => {
          const pageId = generateId('page');
          const newPage: EditorPage = {
            id: pageId,
            name: pageData.name || `页面${get().pages.length + 1}`,
            duration: pageData.duration || 5000,
            loopType: pageData.loopType || 0,
            bgColor: pageData.bgColor || '#FFFFFF',
            regions: pageData.regions || [createDefaultRegion()]
          };
          
          set((state) => {
            state.pages.push(newPage);
            state.isDirty = true;
          });
          
          return pageId;
        },
        
        removePage: (pageId) => {
          set((state) => {
            const index = state.pages.findIndex(p => p.id === pageId);
            if (index !== -1) {
              state.pages.splice(index, 1);
              
              // 调整当前页面索引
              if (state.currentPageIndex >= state.pages.length) {
                state.currentPageIndex = Math.max(0, state.pages.length - 1);
              }
              
              // 删除对应的画布状态
              delete state.canvasStates[pageId];
              
              state.isDirty = true;
            }
          });
        },
        
        updatePage: (pageId, updates) => {
          set((state) => {
            const page = state.pages.find(p => p.id === pageId);
            if (page) {
              Object.assign(page, updates);
              state.isDirty = true;
            }
          });
        },
        
        duplicatePage: (pageId) => {
          const newPageId = generateId('page');
          
          set((state) => {
            const page = state.pages.find(p => p.id === pageId);
            if (page) {
              const newPage: EditorPage = {
                ...JSON.parse(JSON.stringify(page)), // 深拷贝
                id: newPageId,
                name: `${page.name} 副本`
              };
              
              // 重新生成所有ID
              newPage.regions = newPage.regions.map(region => ({
                ...region,
                id: generateId('region'),
                items: region.items.map(item => ({
                  ...item,
                  id: generateId('item')
                }))
              }));
              
              state.pages.push(newPage);
              state.isDirty = true;
            }
          });
          
          return newPageId;
        },
        
        reorderPages: (fromIndex, toIndex) => {
          set((state) => {
            const [movedPage] = state.pages.splice(fromIndex, 1);
            state.pages.splice(toIndex, 0, movedPage);
            
            // 调整当前页面索引
            if (state.currentPageIndex === fromIndex) {
              state.currentPageIndex = toIndex;
            } else if (fromIndex < state.currentPageIndex && toIndex >= state.currentPageIndex) {
              state.currentPageIndex--;
            } else if (fromIndex > state.currentPageIndex && toIndex <= state.currentPageIndex) {
              state.currentPageIndex++;
            }
            
            state.isDirty = true;
          });
        },
        
        setCurrentPage: (index) => {
          set((state) => {
            if (index >= 0 && index < state.pages.length) {
              state.currentPageIndex = index;
              state.selectedObjectIds = []; // 切换页面时清空选择
            }
          });
        },
        
        getCurrentPage: () => {
          const state = get();
          return state.pages[state.currentPageIndex] || null;
        },
        
        // 区域管理方法
        addRegion: (pageId, regionData = {}) => {
          const regionId = generateId('region');
          const newRegion: EditorRegion = {
            id: regionId,
            name: regionData.name || `区域${Date.now()}`,
            rect: regionData.rect || {
              x: 0,
              y: 0,
              width: DEFAULT_PROGRAM_SIZE.width,
              height: DEFAULT_PROGRAM_SIZE.height,
              borderWidth: 0
            },
            items: regionData.items || [],
            isScheduleRegion: regionData.isScheduleRegion || false,
            layer: regionData.layer
          };
          
          set((state) => {
            const page = state.pages.find(p => p.id === pageId);
            if (page) {
              page.regions.push(newRegion);
              state.isDirty = true;
            }
          });
          
          return regionId;
        },
        
        removeRegion: (pageId, regionId) => {
          set((state) => {
            const page = state.pages.find(p => p.id === pageId);
            if (page) {
              const index = page.regions.findIndex(r => r.id === regionId);
              if (index !== -1) {
                page.regions.splice(index, 1);
                state.isDirty = true;
              }
            }
          });
        },
        
        updateRegion: (pageId, regionId, updates) => {
          set((state) => {
            const page = state.pages.find(p => p.id === pageId);
            if (page) {
              const region = page.regions.find(r => r.id === regionId);
              if (region) {
                Object.assign(region, updates);
                state.isDirty = true;
              }
            }
          });
        },
        
        duplicateRegion: (pageId, regionId) => {
          const newRegionId = generateId('region');
          
          set((state) => {
            const page = state.pages.find(p => p.id === pageId);
            if (page) {
              const region = page.regions.find(r => r.id === regionId);
              if (region) {
                const newRegion: EditorRegion = {
                  ...JSON.parse(JSON.stringify(region)), // 深拷贝
                  id: newRegionId,
                  name: `${region.name} 副本`,
                  items: region.items.map(item => ({
                    ...item,
                    id: generateId('item')
                  }))
                };
                
                page.regions.push(newRegion);
                state.isDirty = true;
              }
            }
          });
          
          return newRegionId;
        },
        
        // 素材项管理方法
        addItem: (pageId, regionId, itemData) => {
          const itemId = generateId('item');
          const newItem: EditorItem = {
            id: itemId,
            type: itemData.type || ItemType.SINGLE_LINE_TEXT,
            name: itemData.name,
            position: itemData.position || { x: 100, y: 100 },
            size: itemData.size || { width: 200, height: 50 },
            properties: itemData.properties || {},
            materialRef: itemData.materialRef,
            fabricData: itemData.fabricData
          };
          
          set((state) => {
            const page = state.pages.find(p => p.id === pageId);
            if (page) {
              const region = page.regions.find(r => r.id === regionId);
              if (region) {
                region.items.push(newItem);
                state.isDirty = true;
              }
            }
          });
          
          return itemId;
        },

        // 便捷：通过 itemId 操作
        updateItemProperties: (itemId, properties) => {
          set((state) => {
            for (const page of state.pages) {
              for (const region of page.regions) {
                const item = region.items.find(i => i.id === itemId);
                if (item) {
                  item.properties = { ...(item.properties || {}), ...(properties || {}) };
                  state.isDirty = true;
                  return;
                }
              }
            }
          });
        },
        updateItemPosition: (itemId, position) => {
          set((state) => {
            for (const page of state.pages) {
              for (const region of page.regions) {
                const item = region.items.find(i => i.id === itemId);
                if (item) {
                  item.position = { ...item.position, ...position };
                  state.isDirty = true;
                  return;
                }
              }
            }
          });
        },
        updateItemSize: (itemId, size) => {
          set((state) => {
            for (const page of state.pages) {
              for (const region of page.regions) {
                const item = region.items.find(i => i.id === itemId);
                if (item) {
                  item.size = { ...item.size, ...size };
                  state.isDirty = true;
                  return;
                }
              }
            }
          });
        },
        duplicateItemById: (itemId) => {
          let newId: string | null = null;
          set((state) => {
            for (const page of state.pages) {
              for (const region of page.regions) {
                const idx = region.items.findIndex(i => i.id === itemId);
                if (idx !== -1) {
                  const item = region.items[idx];
                  const copy = { ...JSON.parse(JSON.stringify(item)), id: generateId('item') } as EditorItem;
                  region.items.splice(idx + 1, 0, copy);
                  state.isDirty = true;
                  newId = copy.id;
                  return;
                }
              }
            }
          });
          return newId;
        },
        deleteItemById: (itemId) => {
          set((state) => {
            for (const page of state.pages) {
              for (const region of page.regions) {
                const idx = region.items.findIndex(i => i.id === itemId);
                if (idx !== -1) {
                  region.items.splice(idx, 1);
                  state.isDirty = true;
                  return;
                }
              }
            }
          });
        },
        moveItemUp: (itemId) => {
          set((state) => {
            const canvas = state.canvasInstance;
            if (canvas) {
              const obj = canvas.getObjects().find((o: any) => o.id === itemId);
              if (obj) canvas.bringForward(obj);
            }
            // 可选：记录zIndex到属性，便于无画布排序
            for (const page of state.pages) {
              for (const region of page.regions) {
                const item = region.items.find(i => i.id === itemId);
                if (item) {
                  const current = typeof (item.properties as any)?.zIndex === 'number' ? (item.properties as any).zIndex : 0;
                  (item.properties as any).zIndex = current + 1;
                }
              }
            }
          });
        },
        moveItemDown: (itemId) => {
          set((state) => {
            const canvas = state.canvasInstance;
            if (canvas) {
              const obj = canvas.getObjects().find((o: any) => o.id === itemId);
              if (obj) canvas.sendBackwards(obj);
            }
            for (const page of state.pages) {
              for (const region of page.regions) {
                const item = region.items.find(i => i.id === itemId);
                if (item) {
                  const current = typeof (item.properties as any)?.zIndex === 'number' ? (item.properties as any).zIndex : 0;
                  (item.properties as any).zIndex = Math.max(0, current - 1);
                }
              }
            }
          });
        },
        moveItemToTop: (itemId) => {
          set((state) => {
            const canvas = state.canvasInstance;
            if (canvas) {
              const obj = canvas.getObjects().find((o: any) => o.id === itemId);
              if (obj) canvas.bringToFront(obj);
            }
            for (const page of state.pages) {
              for (const region of page.regions) {
                const item = region.items.find(i => i.id === itemId);
                if (item) {
                  (item.properties as any).zIndex = (region.items?.length || 1);
                }
              }
            }
          });
        },
        moveItemToBottom: (itemId) => {
          set((state) => {
            const canvas = state.canvasInstance;
            if (canvas) {
              const obj = canvas.getObjects().find((o: any) => o.id === itemId);
              if (obj) canvas.sendToBack(obj);
            }
            for (const page of state.pages) {
              for (const region of page.regions) {
                const item = region.items.find(i => i.id === itemId);
                if (item) {
                  (item.properties as any).zIndex = 0;
                }
              }
            }
          });
        },

        // 将 item 在数组顺序上移一位（用于播放顺序）
        moveItemEarlier: (itemId) => {
          set((state) => {
            for (const page of state.pages) {
              for (const region of page.regions) {
                const idx = region.items.findIndex(i => i.id === itemId);
                if (idx > 0) {
                  const [moved] = region.items.splice(idx, 1);
                  region.items.splice(idx - 1, 0, moved);
                  state.isDirty = true;
                  return;
                }
              }
            }
          });
        },
        // 将 item 在数组顺序下移一位（用于播放顺序）
        moveItemLater: (itemId) => {
          set((state) => {
            for (const page of state.pages) {
              for (const region of page.regions) {
                const idx = region.items.findIndex(i => i.id === itemId);
                if (idx !== -1 && idx < region.items.length - 1) {
                  const [moved] = region.items.splice(idx, 1);
                  region.items.splice(idx + 1, 0, moved);
                  state.isDirty = true;
                  return;
                }
              }
            }
          });
        },
        
        removeItem: (pageId, regionId, itemId) => {
          set((state) => {
            const page = state.pages.find(p => p.id === pageId);
            if (page) {
              const region = page.regions.find(r => r.id === regionId);
              if (region) {
                const index = region.items.findIndex(item => item.id === itemId);
                if (index !== -1) {
                  region.items.splice(index, 1);
                  
                  // 从选择中移除
                  const selectedIndex = state.selectedObjectIds.indexOf(itemId);
                  if (selectedIndex !== -1) {
                    state.selectedObjectIds.splice(selectedIndex, 1);
                  }
                  
                  state.isDirty = true;
                }
              }
            }
          });
        },
        
        updateItem: (pageId, regionId, itemId, updates) => {
          set((state) => {
            const page = state.pages.find(p => p.id === pageId);
            if (page) {
              const region = page.regions.find(r => r.id === regionId);
              if (region) {
                const item = region.items.find(i => i.id === itemId);
                if (item) {
                  Object.assign(item, updates);
                  state.isDirty = true;
                }
              }
            }
          });
        },
        
        duplicateItem: (pageId, regionId, itemId) => {
          const newItemId = generateId('item');
          
          set((state) => {
            const page = state.pages.find(p => p.id === pageId);
            if (page) {
              const region = page.regions.find(r => r.id === regionId);
              if (region) {
                const item = region.items.find(i => i.id === itemId);
                if (item) {
                  const newItem: EditorItem = {
                    ...JSON.parse(JSON.stringify(item)), // 深拷贝
                    id: newItemId,
                    name: item.name ? `${item.name} 副本` : undefined,
                    position: {
                      x: item.position.x + 20,
                      y: item.position.y + 20
                    }
                  };
                  
                  region.items.push(newItem);
                  state.isDirty = true;
                }
              }
            }
          });
          
          return newItemId;
        },
        
        moveItem: (fromPageId, fromRegionId, itemId, toPageId, toRegionId) => {
          set((state) => {
            const fromPage = state.pages.find(p => p.id === fromPageId);
            const toPage = state.pages.find(p => p.id === toPageId);
            
            if (fromPage && toPage) {
              const fromRegion = fromPage.regions.find(r => r.id === fromRegionId);
              const toRegion = toPage.regions.find(r => r.id === toRegionId);
              
              if (fromRegion && toRegion) {
                const itemIndex = fromRegion.items.findIndex(i => i.id === itemId);
                if (itemIndex !== -1) {
                  const [item] = fromRegion.items.splice(itemIndex, 1);
                  toRegion.items.push(item);
                  state.isDirty = true;
                }
              }
            }
          });
        },
        
        // 画布状态管理方法
        updateCanvasState: (pageId, canvasState) => {
          set((state) => {
            if (!state.canvasStates[pageId]) {
              state.canvasStates[pageId] = {
                objects: [],
                zoom: 1,
                panX: 0,
                panY: 0
              };
            }
            Object.assign(state.canvasStates[pageId], canvasState);
            state.isDirty = true;
          });
        },
        
        getCanvasState: (pageId) => {
          return get().canvasStates[pageId] || null;
        },
        setCanvas: (canvas) => {
          set((state) => {
            state.canvasInstance = canvas;
          });
        },
        getCanvas: () => {
          return get().canvasInstance;
        },
        
        // 选择管理方法
        selectObjects: (objectIds) => {
          set((state) => {
            state.selectedObjectIds = [...objectIds];
          });
        },
        setSelectedObjects: (objectIds) => {
          set((state) => {
            state.selectedObjectIds = [...objectIds];
          });
        },
        
        addSelectedObject: (objectId) => {
          set((state) => {
            if (!state.selectedObjectIds.includes(objectId)) {
              state.selectedObjectIds.push(objectId);
            }
          });
        },
        
        removeSelectedObject: (objectId) => {
          set((state) => {
            const index = state.selectedObjectIds.indexOf(objectId);
            if (index !== -1) {
              state.selectedObjectIds.splice(index, 1);
            }
          });
        },
        
        clearSelection: () => {
          set((state) => {
            state.selectedObjectIds = [];
          });
        },
        
        setActiveTool: (toolId) => {
          set((state) => {
            state.activeToolId = toolId;
          });
        },
        
        // 历史记录方法
        saveToHistory: (description) => {
          set((state) => {
            const currentState = JSON.parse(JSON.stringify({
              program: state.program,
              pages: state.pages,
              currentPageIndex: state.currentPageIndex,
              canvasStates: state.canvasStates
            }));
            
            const historyItem: HistoryItem = {
              id: generateId('history'),
              timestamp: Date.now(),
              description,
              state: currentState
            };
            
            // 如果当前不在历史记录的末尾，删除后续记录
            if (state.historyIndex < state.history.length - 1) {
              state.history = state.history.slice(0, state.historyIndex + 1);
            }
            
            state.history.push(historyItem);
            state.historyIndex = state.history.length - 1;
            
            // 限制历史记录大小
            if (state.history.length > state.maxHistorySize) {
              state.history.shift();
              state.historyIndex--;
            }
          });
        },
        
        undo: () => {
          const state = get();
          if (state.historyIndex > 0) {
            set((draft) => {
              draft.historyIndex--;
              const historyItem = draft.history[draft.historyIndex];
              Object.assign(draft, historyItem.state);
              draft.isDirty = true;
            });
            return true;
          }
          return false;
        },
        
        redo: () => {
          const state = get();
          if (state.historyIndex < state.history.length - 1) {
            set((draft) => {
              draft.historyIndex++;
              const historyItem = draft.history[draft.historyIndex];
              Object.assign(draft, historyItem.state);
              draft.isDirty = true;
            });
            return true;
          }
          return false;
        },
        
        canUndo: () => {
          const state = get();
          return state.historyIndex > 0;
        },
        
        canRedo: () => {
          const state = get();
          return state.historyIndex < state.history.length - 1;
        },
        
        clearHistory: () => {
          set((state) => {
            state.history = [];
            state.historyIndex = -1;
          });
        },
        
        // 工具函数
        findItem: (itemId) => {
          const state = get();
          for (const page of state.pages) {
            for (const region of page.regions) {
              const item = region.items.find(i => i.id === itemId);
              if (item) {
                return {
                  pageId: page.id,
                  regionId: region.id,
                  item
                };
              }
            }
          }
          return null;
        },
        
        findRegion: (regionId) => {
          const state = get();
          for (const page of state.pages) {
            const region = page.regions.find(r => r.id === regionId);
            if (region) {
              return {
                pageId: page.id,
                region
              };
            }
          }
          return null;
        },
        
        findPage: (pageId) => {
          const state = get();
          return state.pages.find(p => p.id === pageId) || null;
        },
        
        // 状态管理方法
        setLoading: (loading) => {
          set((state) => {
            state.isLoading = loading;
          });
        },
        
        setSaving: (saving) => {
          set((state) => {
            state.isSaving = saving;
          });
        },
        
        markDirty: () => {
          set((state) => {
            state.isDirty = true;
          });
        },
        
        markClean: () => {
          set((state) => {
            state.isDirty = false;
          });
        }
      })),
      {
        name: 'program-editor-store', // 用于devtools
      }
    )
  )
);

// 导出状态选择器，便于组件使用
export const useCurrentPage = () => useEditorStore(state => state.pages[state.currentPageIndex]);
export const useSelectedObjects = () => useEditorStore(state => state.selectedObjectIds);
export const useActiveTool = () => useEditorStore(state => state.activeToolId);
export const useCanUndo = () => useEditorStore(state => state.canUndo());
export const useCanRedo = () => useEditorStore(state => state.canRedo());
export const useIsDirty = () => useEditorStore(state => state.isDirty);
export const useIsLoading = () => useEditorStore(state => state.isLoading);
export const useIsSaving = () => useEditorStore(state => state.isSaving);