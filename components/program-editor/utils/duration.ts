import { EditorItem, EditorPage, EditorRegion, EditorState, ItemType } from '../types'

// 计算单个素材项时长：优先 Item.properties.duration，其次素材引用的 duration，最后默认 5000ms
export function computeItemDuration(item: EditorItem): number {
  const props: any = item.properties || {}
  const explicit = typeof props.duration === 'number' ? props.duration : undefined
  const fromMaterial = item.materialRef?.duration
  const fallback = 5000
  return explicit ?? fromMaterial ?? fallback
}

// 区域时长：所有 Item 时长之和
export function computeRegionDuration(region: EditorRegion): number {
  return (region.items || []).reduce((sum, item) => sum + computeItemDuration(item), 0)
}

// 页面时长：所有区域时长的最大值；当 loopType=0（指定时长）时，优先使用 page.duration
export function computePageDuration(page: EditorPage): number {
  const computed = (page.regions || []).reduce((max, region) => {
    const dur = computeRegionDuration(region)
    return Math.max(max, dur)
  }, 0)
  if (page.loopType === 0) {
    return typeof page.duration === 'number' ? page.duration : (computed || 5000)
  }
  return computed || 5000
}

// 节目总时长：所有页面时长之和
export function computeProgramDuration(state: EditorState): number {
  return (state.pages || []).reduce((sum, page) => sum + computePageDuration(page), 0)
}

