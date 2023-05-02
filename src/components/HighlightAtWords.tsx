import type { FC } from "react";

interface Props {
  text: string;
}

const HighlightAtWords: FC<Props> = ({ text }) => {
  const words = text.split(` `);

  const highlightedWords = words.map((word, index) => {
    if (word.startsWith(`@`)) {
      return (
        <span key={index} className="font-semibold text-infoActive">
          {word}{` `}
        </span>
      );
    }

    return <span key={index}>{word} </span>;
  });

  return <div className="text-[14px] ">{highlightedWords}</div>;
};

export default HighlightAtWords;
