import { atom, useSetAtom } from "jotai";
import { filter, first, get as getProp, map } from "lodash-es";
import { useCallback } from "react";
import { pageBlocksAtomsAtom } from "../atoms/blocks";
import { STYLES_KEY } from "../constants/STRINGS.ts";
import { getNewClasses } from "../functions/GetNewClasses";
import { useBlocksStoreUndoableActions } from "../history/useBlocksStoreUndoableActions.ts";
import { ChaiBlock } from "../types/ChaiBlock";
import { selectedStylingBlocksAtom, TStyleBlock } from "./useSelectedStylingBlocks";

const getSplitClasses = (classesString: string) => {
  const splitClasses: string[] = classesString.replace(STYLES_KEY, "").split(",");
  return { baseClasses: splitClasses[0], classes: splitClasses[1] };
};

type Created = {
  blockIds: Array<string>;
  dispatch: (action: any) => void;
  newClasses: Array<string>;
};

/**
 * Core Styling function
 * @param blockIds
 * @param newClasses
 * @param dispatch
 */
export const addClassesToBlocksAtom: any = atom(null, (get, _set, { blockIds, newClasses }: Created) => {
  // @ts-ignore
  const blockAtoms = filter(get(pageBlocksAtomsAtom), (blockAtom) =>
    // @ts-ignore
    blockIds.includes(get(blockAtom)._id),
  );
  const styleBlock = first(get(selectedStylingBlocksAtom)) as TStyleBlock;
  return map(blockAtoms, (blockAtom) => {
    const block: ChaiBlock = get(blockAtom as any);
    const classesString: string = getProp(block, styleBlock.prop, `${STYLES_KEY},`);
    const { baseClasses, classes } = getSplitClasses(classesString);
    return {
      ids: [block._id],
      props: { [styleBlock.prop]: `${STYLES_KEY}${getNewClasses(classes, baseClasses, newClasses)}` },
    };
  });
});

export const useAddClassesToBlocks = () => {
  const addClassesToBlocks = useSetAtom(addClassesToBlocksAtom);
  const { updateBlocks, updateBlocksRuntime } = useBlocksStoreUndoableActions();
  return useCallback(
    (blockIds: Array<string>, newClasses: Array<string>, undo: boolean = false) => {
      const blocks = addClassesToBlocks({ blockIds, newClasses });
      if (!undo) {
        updateBlocksRuntime(blockIds, blocks[0].props);
        return;
      }
      updateBlocks(blockIds, blocks[0].props);
    },
    [addClassesToBlocks, updateBlocks, updateBlocksRuntime],
  );
};
