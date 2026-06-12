const ComingSoon = ({ featureName, description }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-10 text-center border-2 border-dashed border-indigo-300">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">🚀 Coming Soon</h2>
      <p className="text-gray-600 mb-2">{featureName} is under development.</p>
      <p className="text-gray-500">{description || "We'll notify you when it's ready. Upgrade to Pro for early access."}</p>
    </div>
  );
};
export default ComingSoon;
