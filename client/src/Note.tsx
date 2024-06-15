import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterNoneIcon from "@mui/icons-material/FilterNone";
import GetAppIcon from "@mui/icons-material/GetApp";
import HelpOutline from "@mui/icons-material/HelpOutline";
import MenuIcon from "@mui/icons-material/Menu";
import MyLocation from "@mui/icons-material/MyLocation";
import ReplayIcon from "@mui/icons-material/Replay";
import SaveIcon from "@mui/icons-material/Save";
import StarIcon from "@mui/icons-material/Star";
import * as React from "react";
import { useContext, useRef, useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { useLocation } from "react-router-dom";
import CSSTransition from "react-transition-group/CSSTransition";
import ChangelogsModal from "./ChangelogsModal";
import Flashcards from "./Flashcards";
import HelpModal from "./HelpModal";
import PreviewAndEditor from "./PreviewAndEditor";
import ReviewMenu from "./ReviewMenu";
import { SelectionMenu } from "./SelectionMenu";
import { StateContext } from "./state/StateProvider";
import Button from "./ui/Button";
import EditSwitch from "./ui/EditSwitch";
import { copyToClipboard } from "./uni/src/utils/clipboard";
import pubsub from "./utils/pubsub";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const Note: React.FC<{
  onReview?: () => void;
  onDelete?: () => void;
}> = ({ onReview, onDelete }) => {
  const [pending, setPending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reviewMenuOpen, setReviewMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isChangelogsModalOpen, setIsChangelogsModalOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");

  const query = useQuery();
  const edit = query.get("edit");

  const {
    currentNote,
    deleteCurrentNote,
    markReviewedCurrentNote,
    toggleFocusMode,
    focusMode,
    noteSaving,
    toggleFavCurrentNote,
    toggleFlashcardsVisible,
    flashcardsVisible,
    createNoteAndLinkFromCurrent,
    saveCurrentNote,
  } = useContext(StateContext);

  React.useEffect(() => {
    setMode(edit ? "edit" : "view");
  }, [edit]);

  const handleDelete: React.MouseEventHandler = async () => {
    if (confirm("Are you sure want to delete this note?")) {
      deleteCurrentNote();

      if (onDelete) {
        onDelete();
      }
    }
    setMenuOpen(false);
  };

  const handleReview: React.MouseEventHandler = async () => {
    markReviewedCurrentNote();
    if (onReview) {
      onReview();
    }
  };

  const handleMenuToggle: React.MouseEventHandler = (e) => {
    e.preventDefault();
    setMenuOpen(!menuOpen);
  };

  const handleReviewMenuToggle: React.MouseEventHandler = (e) => {
    e.preventDefault();
    setReviewMenuOpen(!reviewMenuOpen);
  };

  const handleCopyToClipboard = () => {
    if (!currentNote) {
      return;
    }
    const note = currentNote;
    if (!note) {
      return;
    }
    copyToClipboard(note.body || "");
    setMenuOpen(false);
  };

  const handleDownload = () => {
    if (!currentNote) {
      return;
    }
    const note = currentNote;
    if (!note) {
      return;
    }
    window.location.href = `/api/notes/${note.sid}.md`;
    setMenuOpen(false);
  };

  const handleOpenChangelogs: React.MouseEventHandler = (e) => {
    e.preventDefault();
    setIsChangelogsModalOpen(true);
    setMenuOpen(false);
  };

  const handleOpenHelp: React.MouseEventHandler = (e) => {
    e.preventDefault();
    setIsHelpModalOpen(true);
    setMenuOpen(false);
  };

  const handleFav: React.MouseEventHandler = (e) => {
    e.preventDefault();
    toggleFavCurrentNote();
  };

  const handleModeChange = (m: "edit" | "view") => {
    setMode(m);
  };

  const handleAnswerCard = (text: string) => {
    pubsub.publish("flashCardFromAnswer", text);
  };

  const handleQuestionCard = (text: string) => {
    pubsub.publish("flashCardFromQuestion", text);
  };

  const handleCreateNote = (title: string) => {
    createNoteAndLinkFromCurrent(title);
  };

  const handleAskAI = async (text: string) => {
    pubsub.publish("flashCardsFromAI", text);
  };

  const previewRef = useRef<HTMLDivElement>(null);

  if (!currentNote) {
    return null;
  }

  return (
    <div className="inner">
      {mode === "view" && (
        <SelectionMenu
          onUseAsAnswer={handleAnswerCard}
          onUseAsQuestion={handleQuestionCard}
          onCreateNote={handleCreateNote}
          onAskAI={handleAskAI}
          areaRef={previewRef}
        />
      )}

      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <ChangelogsModal
        open={isChangelogsModalOpen}
        onClose={() => setIsChangelogsModalOpen(false)}
        sid={currentNote.sid}
      />
      <div className="note-section">
        <div className="editor-place">
          {!flashcardsVisible && !focusMode && (
            <div
              className="flashcards-toggler"
              onClick={toggleFlashcardsVisible}
            >
              <FilterNoneIcon /> Flashcards
            </div>
          )}

          <div className="note-panel">
            <div className="note-panel-inner">
              <CSSTransition
                in={reviewMenuOpen}
                classNames="atop"
                timeout={200}
                unmountOnExit
              >
                <OutsideClickHandler
                  onOutsideClick={() => {
                    if (reviewMenuOpen) {
                      setReviewMenuOpen(false);
                    }
                  }}
                >
                  <div className="dropdown-menu">
                    <ReviewMenu
                      upcomingReviews={currentNote.upcoming_reviews_in_days}
                    />
                  </div>
                </OutsideClickHandler>
              </CSSTransition>
              <CSSTransition
                in={menuOpen}
                classNames="atop"
                timeout={200}
                unmountOnExit
              >
                <OutsideClickHandler
                  onOutsideClick={() => {
                    if (menuOpen) {
                      setMenuOpen(false);
                    }
                  }}
                >
                  <div className="dropdown-menu">
                    <div className="menu-item" onClick={handleCopyToClipboard}>
                      <FilterNoneIcon />
                      <span>Copy to clipboard</span>
                    </div>
                    <div className="menu-item" onClick={handleDownload}>
                      <GetAppIcon />
                      <span>Download as markdown</span>
                    </div>
                    <div className="menu-item" onClick={handleOpenChangelogs}>
                      <ReplayIcon />
                      <span>Latest changes</span>
                    </div>
                    <div className="menu-item" onClick={handleOpenHelp}>
                      <HelpOutline />
                      <span>How to use the editor?</span>
                    </div>
                    <div className="menu-item" onClick={handleDelete}>
                      <DeleteIcon />
                      <span>Delete note</span>
                    </div>
                  </div>
                </OutsideClickHandler>
              </CSSTransition>
              <div className="inside">
                <div className="left">
                  <div className="edit-toggle">
                    <EditSwitch value={mode} onChange={handleModeChange} />
                  </div>

                  <SaveIcon
                    className={`save ${pending ? "pending" : ""} ${
                      noteSaving ? "saving" : ""
                    }`}
                  />
                </div>
                <div className="right">
                  {currentNote.needs_review && (
                    <Button
                      icon={<CheckIcon />}
                      onClick={handleReview}
                      className="review-btn"
                    >
                      mark as reviewed
                    </Button>
                  )}
                  <a
                    href="#"
                    className={`menu-action menu-action-more ${
                      reviewMenuOpen ? "active" : ""
                    }`}
                    onClick={handleReviewMenuToggle}
                  >
                    {reviewMenuOpen ? (
                      <CloseIcon />
                    ) : (
                      <span className="level">L{currentNote.level || 0}</span>
                    )}
                  </a>
                  <a
                    onClick={handleFav}
                    className={`menu-action ${
                      currentNote.favorite ? "active" : ""
                    }`}
                  >
                    <StarIcon />
                  </a>
                  <a
                    href="#"
                    className={`menu-action ${focusMode ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFocusMode();
                    }}
                    title={focusMode ? "Quit the focus mode" : "Focus mode"}
                  >
                    <MyLocation />
                  </a>
                  <a
                    href="#"
                    className={`menu-action menu-action-more ${
                      menuOpen ? "active" : ""
                    }`}
                    title="More menu items"
                    onClick={handleMenuToggle}
                  >
                    {menuOpen ? <CloseIcon /> : <MenuIcon />}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <PreviewAndEditor
            sid={currentNote.sid}
            body={currentNote.body}
            mode={mode}
            previewRef={previewRef}
            onPendingStart={() => setPending(true)}
            onPendingEnd={() => setPending(false)}
            saveFn={saveCurrentNote}
          />
        </div>
        {!focusMode && <Flashcards noteId={currentNote.id} />}
      </div>
    </div>
  );
};

export default Note;
