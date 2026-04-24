declare const APP_VERSION: string
declare const GIT_COMMIT: string

export default function () {
  return (
    <div className="page">
      <div className="settings-page">
        <div className="settings-block">
          <h2>About</h2>
          <div className="settings-info-row">
            <span className="settings-label">Version</span>
            <span className="settings-value">v{APP_VERSION}</span>
          </div>
          {GIT_COMMIT && (
            <div className="settings-info-row">
              <span className="settings-label">Commit</span>
              <span className="settings-value">{GIT_COMMIT}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
