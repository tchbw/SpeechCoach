import { Button } from "@/client/components/ui/button";
// import { DocumentPreview } from "../document-preview";
// import FileUploader from "../file-uploader";
import { Input } from "@/client/components/ui/input";
import type { ChatHandler } from "@/client/components/views/project/activity/assistant/ChatHandler.interface";
// import UploadImagePreview from "../upload-image-preview";
// import { useFile } from "./hooks/use-file";

// const ALLOWED_EXTENSIONS = [`png`, `jpg`, `jpeg`, `csv`, `pdf`, `txt`, `docx`];

export default function ChatInput(
  props: Pick<
    ChatHandler,
    | `isLoading`
    | `input`
    | `onFileUpload`
    | `onFileError`
    | `handleInputChange`
    | `messages`
    | `setInput`
    | `append`
  >
) {
  // const {
  //   imageUrl,
  //   setImageUrl,
  //   uploadFile,
  //   files,
  //   removeDoc,
  //   reset,
  //   getAnnotations,
  // } = useFile();

  // default submit function does not handle including annotations in the message
  // so we need to use append function to submit new message with annotations
  // const handleSubmitWithAnnotations = (
  //   e: React.FormEvent<HTMLFormElement>
  //   // annotations: JSONValue[] | undefined
  // ) => {
  //   e.preventDefault();
  //   // props.append!({
  //   //   content: props.input,
  //   //   role: `user`,
  //   //   createdAt: new Date(),
  //   //   annotations,
  //   // });
  //   props.setInput!(``);
  // };

  // const handleUploadFile = async (file: File) => {
  //   if (imageUrl || files.length > 0) {
  //     alert(`You can only upload one file at a time.`);
  //     return;
  //   }
  //   try {
  //     await uploadFile(file);
  //     props.onFileUpload?.(file);
  //   } catch (error: any) {
  //     props.onFileError?.(error.message);
  //   }
  // };

  return (
    <div className="shrink-0 space-y-4 rounded-xl bg-white p-4 shadow-xl">
      {/*{imageUrl && (*/}
      {/*  <UploadImagePreview url={imageUrl} onRemove={() => setImageUrl(null)} />*/}
      {/*)}*/}
      {/*{files.length > 0 && (*/}
      {/*  <div className="flex w-full gap-4 overflow-auto py-2">*/}
      {/*    {files.map((file) => (*/}
      {/*      <DocumentPreview*/}
      {/*        key={file.id}*/}
      {/*        file={file}*/}
      {/*        onRemove={() => removeDoc(file)}*/}
      {/*      />*/}
      {/*    ))}*/}
      {/*  </div>*/}
      {/*)}*/}
      <div className="flex w-full items-start justify-between gap-4 ">
        <Input
          autoFocus
          autoComplete="off"
          name="message"
          placeholder="Type a message"
          className="flex-1"
          value={props.input}
          onChange={props.handleInputChange}
        />
        {/*<FileUploader*/}
        {/*  onFileUpload={handleUploadFile}*/}
        {/*  onFileError={props.onFileError}*/}
        {/*  config={{*/}
        {/*    allowedExtensions: ALLOWED_EXTENSIONS,*/}
        {/*    disabled: props.isLoading,*/}
        {/*  }}*/}
        {/*/>*/}
        <Button type="submit" disabled={props.isLoading || !props.input.trim()}>
          Send message
        </Button>
      </div>
    </div>
  );
}
