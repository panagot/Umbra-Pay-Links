import { permanentRedirect } from "next/navigation";

/** Previous path; canonical page is `/reference`. */
export default function JudgesRedirectPage() {
  permanentRedirect("/reference");
}
