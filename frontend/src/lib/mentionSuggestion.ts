// lib/mentionSuggestion.ts
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import MentionList, { MentionListRef } from '@/features/editor/components/MentionList';
import { api } from './api';

let popup: TippyInstance[] | null = null;

export const mentionSuggestion = {
  items: async ({ query }: { query: string }) => {
    try {
      const users = await api.searchUsers(query);
      return users.map((user) => ({
        id: user.username,
        label: user.username,
        name: user.name,
      }));
    } catch (error) {
      console.error('Error fetching users for mention:', error);
      return [];
    }
  },

  render: () => {
    let component: ReactRenderer<MentionListRef> | null = null;
    let props: any = {};

    return {
      onStart: (propsArg: any) => {
        props = propsArg;
        
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
          maxWidth: 'none',
          hideOnClick: false,
          popperOptions: {
            modifiers: [
              {
                name: 'flip',
                enabled: false,
              },
            ],
          },
        });
      },

      onUpdate(propsArg: any) {
        props = propsArg;
        component?.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup?.[0]?.setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(propsArg: any) {
        if (propsArg.event.key === 'Escape') {
          popup?.[0]?.hide();
          return true;
        }

        if (!component?.ref) {
          return false;
        }

        return component.ref.onKeyDown(propsArg);
      },

      onExit() {
        popup?.[0]?.destroy();
        component?.destroy();
        popup = null;
        component = null;
      },
    };
  },
};
