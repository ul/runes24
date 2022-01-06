import React, { memo, useMemo } from "react";
import debounce from "lodash/debounce";
import { Extension } from "@tiptap/core";
import { useEditor, BubbleMenu, EditorContent } from "@tiptap/react";
import Bold from "@tiptap/extension-bold";
import Color from "@tiptap/extension-color";
import Document from "@tiptap/extension-document";
import History from "@tiptap/extension-history";
import Italic from "@tiptap/extension-italic";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import IconButton from "@mui/material/IconButton";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import FormatColorResetIcon from "@mui/icons-material/FormatColorReset";
import Stack from "@mui/material/Stack";

function Menu({ editor }) {
  return (
    <BubbleMenu
      className="bubble-menu text-editor-toolbar"
      tippyOptions={{ duration: 100 }}
      editor={editor}
    >
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

const Clipboard = Extension.create({
  name: "Shortcuts",
  addKeyboardShortcuts() {
    return {
      "Mod-c": () => document.execCommand("copy"),
      "Mod-v": () => document.execCommand("paste"),
      "Mod-x": () => document.execCommand("cut"),
    };
  },
});

export const TextEditor = memo(function TextEditor({
  content,
  onChange,
  className,
}: {
  content: any;
  onChange: (json: any) => void;
  className?: string;
}) {
  const onUpdate = useMemo(
    () =>
      debounce(({ editor }) => {
        onChange(editor.state.doc.toJSON());
      }, 250),
    [onChange]
  );
  const editor = useEditor({
    extensions: [
      Bold,
      Clipboard,
      Color,
      Document,
      History,
      Italic,
      Paragraph,
      Text,
      TextStyle,
      Underline,
    ],
    content,
    onUpdate,
  });

  if (!editor) return null;

  return (
    <div className={className}>
      <Menu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
});
