// features/editor/components/MentionList.tsx
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface MentionListProps {
  items: Array<{ id: string; label: string; name: string }>;
  command: (item: { id: string; label: string }) => void;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = props.items[index];

      if (item) {
        props.command({ id: item.id, label: item.label });
      }
    };

    const upHandler = () => {
      setSelectedIndex(
        (selectedIndex + props.items.length - 1) % props.items.length
      );
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          upHandler();
          return true;
        }

        if (event.key === 'ArrowDown') {
          downHandler();
          return true;
        }

        if (event.key === 'Enter') {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    return (
      <div className="bg-white border-2 border-black rounded-md shadow-lg overflow-hidden max-h-64 overflow-y-auto z-50">
        {props.items.length ? (
          props.items.map((item, index) => (
            <button
              type="button"
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-start gap-2 ${
                index === selectedIndex ? 'bg-gray-100' : ''
              }`}
              key={item.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                selectItem(index);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
            >
              <div className="flex flex-col">
                <span className="font-medium text-sm text-black">
                  @{item.label}
                </span>
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            </button>
          ))
        ) : (
          <div className="px-4 py-2 text-sm text-gray-500">No users found</div>
        )}
      </div>
    );
  }
);

MentionList.displayName = 'MentionList';

export default MentionList;
