import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import Module1 from './modules/Module1'
import Module2 from './modules/Module2'
import Module3 from './modules/Module3'
import Module4 from './modules/Module4'
import Module5 from './modules/Module5'
import Module6 from './modules/Module6'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/module-1" replace />} />
        <Route path="module-1" element={<Module1 />} />
        <Route path="module-2" element={<Module2 />} />
        <Route path="module-3" element={<Module3 />} />
        <Route path="module-4" element={<Module4 />} />
        <Route path="module-5" element={<Module5 />} />
        <Route path="module-6" element={<Module6 />} />
        <Route path="*" element={<Navigate to="/module-1" replace />} />
      </Route>
    </Routes>
  )
}
