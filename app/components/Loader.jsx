import ContentLoader from "react-content-loader";

export const BoxLoader = (props) => (
  <div className="h-100% w-100%">
    <ContentLoader
      speed={2}
      width={"100%"}
      height={"25px"}
      backgroundColor="#F1F2F6"
      foregroundColor="aquamarine"
      {...props}
    >
      <rect x="0" y="0" rx="0" ry="0" width="242" height="25" />
    </ContentLoader>
  </div>
);
