

export default function AgentMessage({ message }) {
    return (
        <div className="w-full flex justify-start ">
            <p className=" text-white text-start px-4 w-fit mt-4 ml-2 bg-slate-700 rounded-2xl py-2">{message}</p>
        </div>

    )
}
