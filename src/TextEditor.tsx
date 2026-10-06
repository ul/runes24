import React, { memo } from "react";
import { Editor, Extension } from "@tiptap/core";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import Bold from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import Italic from "@tiptap/extension-italic";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { UndoRedo } from "@tiptap/extensions";
import IconButton from "@mui/material/IconButton";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import FormatColorResetIcon from "@mui/icons-material/FormatColorReset";
import Stack from "@mui/material/Stack";
import { Doc } from "./model";

function Menu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu className="bubble-menu text-editor-toolbar" editor={editor}>
      <Stack direction="row" sx={{ p: 0.25 }}>
        <IconButton
          key="bold"
          classes={{
            root: "text-editor-button",
          }}
          size="small"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBoldIcon />
        </IconButton>
        <IconButton
          key="italic"
          classes={{
            root: "text-editor-button",
          }}
          size="small"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalicIcon />
        </IconButton>

        <IconButton
          key="underlined"
          classes={{
            root: "text-editor-button",
          }}
          size="small"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <FormatUnderlinedIcon />
        </IconButton>
        <IconButton
          key="red"
          classes={{
            root: "text-editor-button text-editor-red-button",
          }}
          size="small"
          onClick={() => editor.chain().focus().setColor("red").run()}
        >
          <FormatColorTextIcon />
        </IconButton>
        <IconButton
          key="green"
          classes={{
            root: "text-editor-button text-editor-green-button",
          }}
          size="small"
          onClick={() => editor.chain().focus().setColor("green").run()}
        >
          <FormatColorTextIcon />
        </IconButton>
        <IconButton
          key="blue"
          classes={{
            root: "text-editor-button text-editor-blue-button",
          }}
          size="small"
          onClick={() => editor.chain().focus().setColor("blue").run()}
        >
          <FormatColorTextIcon />
        </IconButton>
        <IconButton
          key="reset"
          classes={{
            root: "text-editor-button",
          }}
          size="small"
          onClick={() => editor.chain().focus().unsetColor().run()}
        >
          <FormatColorResetIcon />
        </IconButton>
      </Stack>
    </BubbleMenu>
  );
}

/** Shift-Alt-Mod-V pastes clipboard text without formatting. */
const PlainTextPaste = Extension.create({
  name: "PlainTextPaste",
  addKeyboardShortcuts() {
    return {
      "Shift-Alt-Mod-v": () => {
        navigator.clipboard
          .readText()
          // As text: insertContent would parse HTML in it.
          .then((text) => {
            const { view, state } = this.editor;
            view.dispatch(state.tr.insertText(text));
          });
        return true;
      },
    };
  },
});

export const TextEditor = memo(function TextEditor({
  content,
  onChange,
  className,
}: {
  content: Doc | undefined;
  onChange: (doc: Doc) => void;
  className?: string;
}) {
  // `content` is only the initial value; afterwards the editor owns the text.
  // Changes are reported on every keystroke (no debounce), so nothing typed
  // is lost when the card unmounts or the app closes; saving to disk is
  // debounced separately.
  const editor = useEditor({
    extensions: [
      Bold,
      PlainTextPaste,
      Color,
      Document,
      UndoRedo,
      Italic,
      Paragraph,
      Text,
      TextStyle,
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getJSON() as Doc),
  });

  if (!editor) return null;

  return (
    <div className={className}>
      <Menu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
});
