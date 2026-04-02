import { AlertTriangle } from 'lucide-react'

export default function MedicalDisclaimer() {
  return (
    <div className="rounded-xl border border-desk-races/30 bg-desk-races/5 p-4 sm:p-5">
      <div className="flex gap-3">
        <AlertTriangle className="w-5 h-5 text-desk-races shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-desk-races mb-1">Medical Disclaimer</h4>
          <p className="text-sm text-text-muted leading-relaxed">
            This content is for informational purposes only and does not constitute medical advice.
            Always consult a qualified healthcare professional before changing your supplement regimen,
            training program, or health routine.
          </p>
        </div>
      </div>
    </div>
  )
}
