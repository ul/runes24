import React, { useMemo, useCallback } from "react";
import {
  BoldExtension,
  ItalicExtension,
  TextColorExtension,
  UnderlineExtension,
} from "remirror/extensions";
import {
  ComponentItem,
  FloatingToolbar,
  ToolbarItemUnion,
  EditorComponent,
  Remirror,
  useRemirror,
  useCommands,
  useKeymap,
} from "@remirror/react";
import "remirror/styles/all.css";
import IconButton from "@mui/material/IconButton";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import FormatColorResetIcon from "@mui/icons-material/FormatColorReset";

function BubbleMenu() {
  const commands = useCommands();
  const floatingToolbarItems: ToolbarItemUnion[] = useMemo(
    () => [
      {
        type: ComponentItem.ToolbarGroup,
        label: "Simple Formatting",
        items: [
          {
            type: ComponentItem.ToolbarElement,
            element: (
              <IconButton
                key="bold"
                classes={{
                  root: "text-editor-button",
                }}
                size="small"
                onClick={() => commands.toggleBold()}
              >
                <FormatBoldIcon />
              </IconButton>
            ),
          },
          {
            type: ComponentItem.ToolbarElement,
            element: (
              <IconButton
                key="italic"
                classes={{
                  root: "text-editor-button",
                }}
                size="small"
                onClick={() => commands.toggleItalic()}
              >
                <FormatItalicIcon />
              </IconButton>
            ),
          },
          {
            type: ComponentItem.ToolbarElement,
            element: (
              <IconButton
                key="underlined"
                classes={{
                  root: "text-editor-button",
                }}
                size="small"
                onClick={() => commands.toggleUnderline()}
              >
                <FormatUnderlinedIcon />
              </IconButton>
            ),
          },
          {
            type: ComponentItem.ToolbarElement,
            element: (
              <IconButton
                key="red"
                classes={{
                  root: "text-editor-button text-editor-red-button",
                }}
                size="small"
                onClick={() => commands.setTextColor("red")}
              >
                <FormatColorTextIcon />
              </IconButton>
            ),
          },
          {
            type: ComponentItem.ToolbarElement,
            element: (
              <IconButton
                key="green"
                classes={{
                  root: "text-editor-button text-editor-green-button",
                }}
                size="small"
                onClick={() => commands.setTextColor("green")}
              >
                <FormatColorTextIcon />
              </IconButton>
            ),
          },
          {
            type: ComponentItem.ToolbarElement,
            element: (
              <IconButton
                key="blue"
                classes={{
                  root: "text-editor-button text-editor-blue-button",
                }}
                size="small"
                onClick={() => commands.setTextColor("blue")}
              >
                <FormatColorTextIcon />
              </IconButton>
            ),
          },
          {
            type: ComponentItem.ToolbarElement,
            element: (
              <IconButton
                key="reset"
                classes={{
                  root: "text-editor-button",
                }}
                size="small"
                onClick={() => commands.removeTextColor()}
              >
                <FormatColorResetIcon />
              </IconButton>
            ),
          },
        ],
      },
    ],
    [commands]
  );
  return (
    <FloatingToolbar
      containerClass="text-editor-toolbar"
      items={floatingToolbarItems}
      positioner="selection"
      placement="right"
    />
  );
}

export function TextEditor({ content, onChange, className }) {
  const { manager, state, setState } = useRemirror({
    extensions: () => [
      new BoldExtension(),
      new ItalicExtension(),
      new UnderlineExtension(),
      new TextColorExtension(),
    ],
    content,
  });

  const hooks = [
    () => {
      const commands = useCommands();
      const handleCopy = useCallback(() => commands.copy(), [commands]);
      const handlePaste = useCallback(() => commands.paste(), [commands]);
      const handleCut = useCallback(() => commands.cut(), [commands]);

      // "Mod" means platform agnostic modifier key - i.e. Ctrl on Windows, or Cmd on MacOS
      useKeymap("Mod-c", handleCopy);
      useKeymap("Mod-v", handlePaste);
      useKeymap("Mod-x", handleCut);
    },
  ];

  return (
    <div className={`remirror-theme text-editor ${className ?? ""}`}>
      <Remirror
        manager={manager}
        initialContent={state}
        hooks={hooks}
        onChange={({ state }) => {
          setState(state);
          onChange(state.doc.toJSON());
        }}
      >
        <EditorComponent />
        <BubbleMenu />
      </Remirror>
    </div>
  );
}
