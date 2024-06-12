import * as React from "react";
import { useEffect, useState } from "react";
import Api from "../api";
import { DataExport } from "../types";
import Button from "../ui/Button";
import GetAppIcon from "@mui/icons-material/GetApp";
import dayjs from "dayjs";

const DataExports: React.FC = () => {
  const [dataExports, setDataExports] = useState<DataExport[]>([]);
  const [working, setWorking] = useState(false);

  const handleExport: React.MouseEventHandler = async (e) => {
    e.preventDefault();
    setWorking(true);
    const de = await Api.dataExports.create();
    setDataExports([...dataExports, de]);
    setWorking(false);
  };

  async function loadData() {
    const de = await Api.dataExports.list();
    setDataExports(de);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="exports-block">
      <h2>Data export</h2>
      <div className="data-exports">
        <p>Dowload all your notes as a single ZIP with markdown files</p>
        {dataExports.map((e) => (
          <div className="data-exports-item" key={e.id}>
            {dayjs(e.created_at).format("YYYY-MM-DD HH:mm:ss")}{" "}
            <a href={e.export_file_url}>Download</a>
          </div>
        ))}
        <div className="actions">
          <Button
            icon={<GetAppIcon />}
            onClick={handleExport}
            disabled={working}
          >
            {working ? "..." : "Export my notes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function () {
  const removeAccount: React.MouseEventHandler = async () => {
    if (!confirm("Are you sure you want to completely remove your account?")) {
      return;
    }

    await Api.users.rmself();
    window.location.href = "/";
  };

  return (
    <div className="page">
      <div className="settings-page">
        <div className="settings-block">
          <h2>Personal</h2>
          <PersonalForm />
        </div>
        <DataExports />
        <div className="settings-block">
          <h2>Delete account</h2>
          <p>
            Please be careful. We don't store your data after account removal so
            we won't be able to recover it.
          </p>
          <button className="btn danger big" onClick={removeAccount}>
            Remove my account
          </button>
        </div>
      </div>
    </div>
  );
}

function PersonalForm() {
  const [saving, setSaving] = useState(false);
  const [tagsToIgnore, setTagsToIgnore] = useState<string>(
    initialTagsToIgnore || ""
  );

  const save: React.MouseEventHandler = async () => {
    setSaving(true);
    await Api.users.updateself({ username, ignore_review_tags: tagsToIgnore });
    setSaving(false);
  };
  return (
    <div>
      <div className="form-field">
        <label>
          Username <br />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
      </div>
      <div className="form-field">
        <label>
          Tags to ignore in review (comma separated)
          <br />
          <input
            type="text"
            value={tagsToIgnore}
            onChange={(e) => setTagsToIgnore(e.target.value)}
          />
        </label>
      </div>
      <div className="form-field">
        <button className="btn big" onClick={save}>
          {saving ? "..." : "Save"}
        </button>
      </div>
    </div>
  );
}
