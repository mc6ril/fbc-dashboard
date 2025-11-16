import NextImage, { ImageProps as NextImageProps } from "next/image";
import React from "react";
import "@/styles/components/_image.scss";

type Props = Omit<NextImageProps, "alt" | "width" | "height"> & {
  alt: string;
  width: number;
  height: number;
  className?: string;
};

const computeClassName = (extra?: string): string => {
  const base = ["image"];
  if (extra && extra.trim().length > 0) {
    base.push(extra);
  }
  return base.join(" ");
};

const ImageComponent = ({ alt, width, height, className, priority, ...rest }: Props) => {
  const classNames = React.useMemo(() => computeClassName(className), [className]);
  // Next/Image handles optimization; we enforce required props to avoid layout shift
  return <NextImage alt={alt} width={width} height={height} priority={priority} className={classNames} {...rest} />;
};

const Image = React.memo(ImageComponent);
export default Image;


