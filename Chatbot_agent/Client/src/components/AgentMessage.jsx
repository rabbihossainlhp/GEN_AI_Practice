import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AgentMessage({ message }) {

    return (
        <div className="w-full flex justify-start">
            <div className="mt-4 ml-2 max-w-3xl rounded-2xl bg-slate-700 px-4 py-3 text-white">
                <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-white prose-strong:text-white prose-li:text-white prose-th:text-white prose-td:text-white">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}