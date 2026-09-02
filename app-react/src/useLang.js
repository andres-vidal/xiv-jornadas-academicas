/* The language, shared with the whole tree. It is one value that almost every
   component needs and nobody changes except the header button, which is exactly
   what a context is for: no prop travels through five components to get there. */
import { createContext, useContext } from "react";
import { STRINGS } from "./strings.js";

export const LangContext = createContext("es");

/* "es" or "en", for the pieces that format numbers */
export const useLang = () => useContext(LangContext);

/* the dictionary for the current language, always called t so the text reads
   short at the point of use: t.header.settings */
export const useT = () => STRINGS[useContext(LangContext)];
