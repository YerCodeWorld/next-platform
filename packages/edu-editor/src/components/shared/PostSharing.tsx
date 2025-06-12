import { TbBrandFacebook, TbBrandLinkedin, TbBrandX } from "react-icons/tb";

// These things must be replaced with actual logic for sharing the link
const PostSharing = () => {
  return (
    <div className="flex justify-center lg:justify-end order-3 lg:order-1">
      <div className="sticky lg:h-[calc(100vh-120px)] top-24 flex lg:flex-col gap-4">
        {/* apparently we can actually fix this to add actual functionality (using onClick()) */}
        {/* We would need to move this component out to the components-ui package */}
        <button>
          <TbBrandFacebook
              size={40}
              className="p-2 rounded-full border border-neutral-300 dark:border-neutral-600"
          />
        </button>
        <TbBrandLinkedin
          size={40}
          className="p-2 rounded-full border border-neutral-300 dark:border-neutral-600"
        />
        <TbBrandX
          size={40}
          className="p-2 rounded-full border border-neutral-300 dark:border-neutral-600"
        />
      </div>
    </div>
  );
};

export default PostSharing;
