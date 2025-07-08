'use client'

import React, { useMemo } from 'react'
import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs'
import { useServerInsertedHTML } from 'next/navigation'

const StyledComponentsRegistry = ({ children }: { children: React.ReactNode }) => {
  const cache = useMemo(() => createCache(), [])
  useServerInsertedHTML(() => (
    <style id="antd" dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }} />
  ))
  return <StyleProvider cache={cache}>{children}</StyleProvider>
}

export default StyledComponentsRegistry
