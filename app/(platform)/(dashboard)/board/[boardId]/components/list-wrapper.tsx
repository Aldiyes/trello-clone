type Props = {
  children: React.ReactNode;
};

export const ListWrapper = ({ children }: Props) => {
  return <li className="h-full w-[272px] shrink-0 select-none">{children}</li>;
};
