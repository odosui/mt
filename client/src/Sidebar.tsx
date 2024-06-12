import { Tag } from "@mui/icons-material";
import FilterNoneIcon from "@mui/icons-material/FilterNone";
import HistoryIcon from "@mui/icons-material/History";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import StarIcon from "@mui/icons-material/Star";
import * as React from "react";
import { useContext, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import CSSTransition from "react-transition-group/CSSTransition";
import TransitionGroup from "react-transition-group/TransitionGroup";
import { StateContext } from "./state/StateProvider";

const Sidebar: React.FC = () => {
  const [tagTerm, setTagTerm] = useState("");

  const { reviewCount, tags, focusMode, questionsCount, totalNoteCount } =
    useContext(StateContext);

  const location = useLocation();

  const filteredTags = tags.loading
    ? []
    : (tags.data || []).filter((t) =>
        t.title.toLowerCase().includes(tagTerm.toLowerCase())
      );

  const isActiveTag = (title: string) => {
    const urlParams = new URLSearchParams(location.search);
    const searchTag = urlParams.get("tag");
    return title === searchTag;
  };

  return (
    <aside className={`menu ${focusMode ? "meditation" : ""}`}>
      <h3 className="section">KNOWLEDGE BASE</h3>
      <div className="menu-item">
        <NavLink
          to="/app/notes"
          className={({ isActive }) => (isActive ? "active" : "")}
          style={{ justifyContent: "space-between" }}
        >
          <div style={{ display: "flex" }}>
            <HomeIcon />
            Notes
          </div>
          <div className="menu-item-count secondary">
            <span>{totalNoteCount}</span>
          </div>
        </NavLink>
      </div>

      <div className="menu-item">
        <NavLink
          to={`/app/fav`}
          className={({ isActive }) => (isActive ? "active" : "")}
          style={{ justifyContent: "space-between" }}
        >
          <div style={{ display: "flex" }}>
            <StarIcon />
            Favorites
          </div>
          <div className="menu-item-count"></div>
        </NavLink>
      </div>

      <div className="menu-item">
        <NavLink
          to={`/app/review`}
          className={({ isActive }) => (isActive ? "active" : "")}
          style={{ justifyContent: "space-between" }}
        >
          <div style={{ display: "flex" }}>
            <HistoryIcon />
            Review
          </div>
          <div className="menu-item-count">
            <span>{reviewCount}</span>
          </div>
        </NavLink>
      </div>
      <div className="menu-item">
        <NavLink
          to={`/app/quiz`}
          className={({ isActive }) => (isActive ? "active" : "")}
          style={{ justifyContent: "space-between" }}
        >
          <div style={{ display: "flex" }}>
            <FilterNoneIcon />
            Flashcards
          </div>
          <div className="menu-item-count">
            {(questionsCount || 0) > 0 && <span>{questionsCount}</span>}
          </div>
        </NavLink>
      </div>
      <div className="menu-item">
        <NavLink
          to={`/app/boards`}
          className={({ isActive }) => (isActive ? "active" : "")}
          style={{ justifyContent: "space-between" }}
        >
          <div style={{ display: "flex" }}>
            <FilterNoneIcon />
            Boards
          </div>
          <div className="menu-item-count"></div>
        </NavLink>
      </div>
      <h3 className="section section-tags">TAGS</h3>
      <div className="menu-tags">
        <div className="tags-search">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search tags"
            value={tagTerm}
            onChange={(e) => setTagTerm(e.target.value)}
          />
        </div>
        <div className="tags-items">
          {(filteredTags || []).length === 0 && (
            <div className="plch">No tags added</div>
          )}
          <TransitionGroup>
            {filteredTags.map((t) => (
              <CSSTransition key={t.name} timeout={200} classNames="slide">
                <NavLink
                  to={`/app/notes?tag=${t.title}`}
                  className={() =>
                    isActiveTag(t.title) ? "active item" : "item"
                  }
                >
                  <div className="tag-and-icon">
                    <Tag />
                    <div
                      className="tag-name"
                      dangerouslySetInnerHTML={{
                        __html: fmt(t.title, tagTerm),
                      }}
                    ></div>
                  </div>
                  <div className="tag-count">{t.count}</div>
                </NavLink>
              </CSSTransition>
            ))}
          </TransitionGroup>
        </div>
      </div>
      <div className="menu-item settings-link">
        <NavLink
          to={`/app/settings`}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <div style={{ display: "flex" }}>
            <SettingsIcon />
            Settings
          </div>
        </NavLink>
      </div>
    </aside>
  );
};

function fmt(title: string, term: string) {
  if (!term || !title) {
    return title;
  }
  return title.replace(new RegExp(`(${term})`, "i"), "<mark>$1</mark>");
}

export default Sidebar;
