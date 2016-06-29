import React from 'react'
import Linter from '../linter'
import { root } from './index.css'

const LinterContainer = ({
  children
}) => {
  return (
    <div className={root}>
      <Linter></Linter>
    </div>
  )
}

export default LinterContainer
