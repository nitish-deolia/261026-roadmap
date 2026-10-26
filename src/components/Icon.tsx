type IconName =
  | "spark"
  | "arrow"
  | "book"
  | "home"
  | "download"
  | "upload"
  | "plus"
  | "edit"
  | "trash"
  | "check"
  | "close";

const iconPaths: Record<IconName, string> = {
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zm7 11l1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1L19 14z",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16ZM4 5.5v16M8 7h8M8 11h8",
  home: "m3 10 9-7 9 7M5 9v12h14V9m-9 12v-7h4v7",
  download: "M12 3v12m-5-5 5 5 5-5M5 20h14",
  upload: "M12 16V4m-5 5 5-5 5 5M5 20h14",
  plus: "M12 5v14M5 12h14",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z",
  trash: "M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6",
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12M18 6 6 18",
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={iconPaths[name]} />
    </svg>
  );
}
