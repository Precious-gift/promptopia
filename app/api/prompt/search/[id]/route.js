import { connectToDB } from "@utils/database";
import Prompt from "@models/prompt";
import User from "@models/user";

export const GET = async (request, { params }) => {
  try {
    await connectToDB();
    const searchText = params.id;
    const searchCriteria = {
      $or: [
        { prompt: { $regex: searchText, $options: "i" } },
        { tag: { $regex: searchText, $options: "i" } },
      ],
    };
    const users = await User.find({
      username: { $regex: searchText, $options: "i" },
    });

    if (users.length > 0) {
      const userIds = users.map((user) => user._id);
      searchCriteria.$or.push({ creator: { $in: userIds } });
    }

    const prompt = await Prompt.find(searchCriteria).populate("creator");

    if (!prompt) return new Response("Prompt not found", { status: 404 });
    return new Response(JSON.stringify(prompt), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch all prompts", { status: 500 });
  }
};
