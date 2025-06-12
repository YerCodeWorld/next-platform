
import MenuButton from "../MenuButton";
import {useEditorState} from "@tiptap/react";
import {useTiptapContext} from "../Provider";
import TableBuilder from "../../components/TableBuilder";

const TableButton = () => {
  const {editor} = useTiptapContext();
  const state = useEditorState({
    editor,
    selector: (ctx) => {
      return {  // this was commented, why?
        disabled: !ctx.editor.can().insertTable(),
      };
    },
  });

  return (
    <MenuButton
      icon="Table"
      tooltip="Table"
      type="popover"
      hideArrow
      {...state}
    >
      <TableBuilder
        onCreate={({rows, cols}) => editor.chain().insertTable({rows, cols, withHeaderRow: false}).focus().run()}
      />
    </MenuButton>
  );
};

export default TableButton;
