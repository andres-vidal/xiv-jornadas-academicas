/* The interface pieces that repeat across the app: the floating card, the small
   caps label, the dropdown, the icon button with its tooltip and the animated
   collapse. None of them knows anything about trees or about data. */
import { Fragment, useState } from "react";
import {
  FloatingFocusManager, FloatingOverlay, FloatingPortal, autoUpdate, flip, offset, shift,
  useDismiss, useFloating, useFocus, useHover, useInteractions, useRole,
} from "@floating-ui/react";
import { ChevronIcon } from "./icons.jsx";
import { useT } from "./useLang.js";

/* A sentence out of strings.js, drawn: *between asterisks* comes out bold and
   {name} is replaced by the matching value. Keeping the two marks inside the
   sentence means each one stays whole in the dictionary, instead of being cut into
   pieces that only make sense next to each other. */
export function rich(text, vars = {}) {
  const fill = s => s.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
  return text.split("*").map((part, i) =>
    i % 2 ? <b key={i}>{fill(part)}</b> : <Fragment key={i}>{fill(part)}</Fragment>);
}

/* Every card floats over the canvas, so it is translucent and blurred: the
   drawing keeps showing through. */
export const CARD = "rounded-xl border border-regla bg-papel/80 backdrop-blur-[10px] " +
  "shadow-[0_4px_16px_-8px_rgba(20,22,28,.4)]";

export function Label({ children }) {
  return (
    <span className="font-mono text-[0.74rem] uppercase tracking-[0.08em] text-mudo">{children}</span>
  );
}

/* Card header: the label on the left, whatever controls it has on the right. */
export function CardHeader({ title, children }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label>{title}</Label>
      {children ? <div className="flex items-center gap-1">{children}</div> : null}
    </div>
  );
}

export function CloseButton({ onClick, label }) {
  const t = useT();
  return (
    <button type="button" aria-label={label || t.ui.close} onClick={onClick}
      className="px-1 text-lg leading-none text-mudo hover:text-tinta">×</button>
  );
}

/* The small borderless button that opens and closes a card. */
export function FoldButton({ open, onClick, labelOpen, labelClosed }) {
  return (
    <button type="button" onClick={onClick} aria-expanded={open}
      aria-label={open ? labelOpen : labelClosed}
      className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-mudo transition-colors
                 hover:bg-panel hover:text-tinta">
      <ChevronIcon up={open} />
    </button>
  );
}

/* Animated collapse to an automatic height. The grid interpolates from 0fr to
   1fr, the only thing that can be animated without knowing the content height in
   advance; the child needs min-h-0 for the clipping to work. */
export function Collapse({ open, children, className = "" }) {
  return (
    <div className={`grid transition-[grid-template-rows] duration-300 ease-out
                     motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
      <div className={"min-h-0 overflow-hidden " + className}>{children}</div>
    </div>
  );
}

/* Modal dialog: header on top, footer at the bottom and, in between, the only
   part that scrolls. That keeps the title and whatever the footer holds in view
   halfway through a read. */
export function Dialog({ context, refs, getFloatingProps, title, onClose, footer, children }) {
  return (
    <FloatingPortal>
      <FloatingOverlay lockScroll
        className="z-[80] grid place-items-center overflow-hidden bg-tinta/25 p-3
                   backdrop-blur-[2px] sm:p-4">
        <FloatingFocusManager context={context}>
          <div ref={refs.setFloating} {...getFloatingProps()}
               className="flex max-h-[86dvh] w-full max-w-[540px] flex-col overflow-hidden
                          rounded-xl border border-regla bg-papel
                          shadow-[0_10px_40px_-12px_rgba(20,22,28,.5)]">
            <div className="flex shrink-0 items-center justify-between border-b border-regla
                            px-4 py-3">
              <Label>{title}</Label>
              <CloseButton onClick={onClose} />
            </div>
            <div className="overflow-y-auto p-4">{children}</div>
            {footer && <div className="shrink-0 border-t border-regla p-3">{footer}</div>}
          </div>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  );
}

/* Our own menu instead of the native <select>, so the dropdown uses the same
   type and colours as everything else. Floating UI places it: it flips and shifts
   on its own instead of being clipped against an edge. */
export function Menu({ value, options, onChange, label }) {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open, onOpenChange: setOpen, placement: "bottom-start",
    middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useDismiss(context), useRole(context, { role: "listbox" }),
  ]);
  const current = options.find(o => o.value === value);

  return (
    <div className="relative min-w-0">
      <button ref={refs.setReference} {...getReferenceProps({
          type: "button", "aria-haspopup": "listbox", "aria-expanded": open,
          "aria-label": label, onClick: () => setOpen(!open),
        })}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-regla
                   bg-papel px-[9px] py-[5px] text-[0.9rem] text-tinta transition-colors hover:bg-panel">
        <span className="truncate">{current ? current.text : "—"}</span>
        <span className="shrink-0 text-mudo"><ChevronIcon up={open} /></span>
      </button>
      {open && (
        <FloatingPortal>
          <ul ref={refs.setFloating} {...getFloatingProps()}
              style={{ ...floatingStyles, minWidth: refs.reference.current?.offsetWidth }}
              className="z-[80] max-h-[60dvh] overflow-y-auto rounded-lg border border-regla bg-papel
                         py-1 shadow-[0_8px_26px_-12px_rgba(20,22,28,.5)]">
            {options.map(o => (
              <li key={o.value}>
                <button type="button" role="option" aria-selected={o.value === value}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`block w-full px-[9px] py-[6px] text-left text-[0.9rem] transition-colors
                    ${o.value === value ? "bg-tinta font-bold text-papel" : "text-tinta hover:bg-panel"}`}>
                  {o.text}
                </button>
              </li>
            ))}
          </ul>
        </FloatingPortal>
      )}
    </div>
  );
}

/* Icon button with a tooltip. In "bare" it has no border and measures 24, to sit
   in a card header; in the action bar it measures 34 and does have one. */
export function IconButton({ tip, onClick, disabled, primary, bare, children, label }) {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open, onOpenChange: setOpen, placement: "top",
    middleware: [offset(9), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { move: false }), useFocus(context),
    useDismiss(context), useRole(context, { role: "tooltip" }),
  ]);
  return (
    <>
      <button ref={refs.setReference} {...getReferenceProps({
          type: "button", onClick, disabled, "aria-label": label,
        })}
        className={bare
          ? `grid h-6 w-6 shrink-0 place-items-center rounded-md text-mudo transition-colors
             hover:bg-panel hover:text-tinta disabled:cursor-default disabled:opacity-30
             disabled:hover:bg-transparent disabled:hover:text-mudo`
          : `grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[9px]
             border transition-colors disabled:cursor-default disabled:opacity-40
             ${primary
               ? "border-tinta bg-tinta text-papel hover:opacity-88"
               : "border-regla bg-papel text-tinta hover:bg-panel"}`}>
        {children}
      </button>
      {open && !disabled && (
        <FloatingPortal>
          <span ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}
            className="z-[90] whitespace-nowrap rounded-[7px] bg-tinta px-[9px] py-[5px]
                       text-[0.87rem] font-normal text-papel">
            {tip}
          </span>
        </FloatingPortal>
      )}
    </>
  );
}

/* The square header button, filled in while whatever it opens is open. */
export function HeaderButton({ open, children, ...props }) {
  return (
    <button type="button" {...props}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-colors
        ${open ? "border-tinta bg-tinta text-papel"
               : "border-regla text-mudo hover:bg-panel hover:text-tinta"}`}>
      {children}
    </button>
  );
}
