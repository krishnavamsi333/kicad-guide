import { useState } from 'react'
import './App.css'

import Header               from './components/Header'
import Tabs                 from './components/Tabs'
import Footer               from './components/Footer'
import Workflow             from './components/Workflow'
import Schematic            from './components/Schematic'
import Layout               from './components/Layout'
import ShortcutSearch       from './components/ShortcutSearch'
import Rules                from './components/Rules'
import Export               from './components/Export'
import InteractiveChecklist from './components/InteractiveChecklist'
import TraceCalculator      from './components/TraceCalculator'
import Resources            from './components/Resources'

const SECTIONS = {
  workflow:    <Workflow />,
  schematic:   <Schematic />,
  layout:      <Layout />,
  shortcuts:   <ShortcutSearch />,
  rules:       <Rules />,
  export:      <Export />,
  checklist:   <InteractiveChecklist />,
  calculators: <TraceCalculator />,
  resources:   <Resources />,
}

export default function App() {
  const [active, setActive] = useState('workflow')
  return (
    <div className="wrapper">
      <Header />
      <Tabs active={active} onChange={setActive} />
      {SECTIONS[active]}
      <Footer />
    </div>
  )
}