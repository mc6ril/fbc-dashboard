/**
 * Card Component
 *
 * A reusable card container component for displaying content in a structured,
 * visually distinct container. Used for dashboard widgets and content sections.
 *
 * The component provides:
 * - Semantic HTML structure using `<article>` element
 * - Optional title with proper heading hierarchy
 * - Accessible structure with proper landmarks
 * - Consistent styling using design system tokens
 *
 * @component
 */

import React from "react";
import "@/styles/components/_card.scss";
import Heading from "@/presentation/components/ui/Heading";

type Props = {
  /** Content to display inside the card */
  children: React.ReactNode;
  /** Optional title for the card. When provided, renders as an h2 heading in a header element */
  title?: string;
  /** Optional additional CSS class names */
  className?: string;
};

const computeClassName = (extra?: string): string => {
  const base = ["card"];
  if (extra && extra.trim().length > 0) {
    base.push(extra);
  }
  return base.join(" ");
};

const CardComponent = ({ children, title, className }: Props) => {
  const classNames = React.useMemo(() => computeClassName(className), [className]);

  return (
    <article className={classNames}>
      {title && (
        <header className="card__header">
          <Heading level={2} className="card__title">
            {title}
          </Heading>
        </header>
      )}
      <div className="card__content">{children}</div>
    </article>
  );
};

const Card = React.memo(CardComponent);
export default Card;

