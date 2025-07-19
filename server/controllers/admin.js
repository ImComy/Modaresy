import { compareHash, get_token } from "../services/authentication.service";

export async function login(req, res) {
    try {
        const input_data = req.body

        const { isMatch, id } = await compareHash(input_data.password, input_data.username, "Admin");
        if (!isMatch) return res.status(400).json({ error: "password or username is invalid" })

        const token = await get_token(id, "Admin");
        if (!token) return res.status(400).json({ error: "cannot generate a token!" });

        return res.status(200).json({ message: "user login successfully!", token })
    } catch (err) {
        return res.status(500).json({ error: "Internal server error: " + err.message })
    }
}
export async function removeTutor(req, res) {
    try {
        const { teacher } = req;
        if (!teacher) return res.status(404).json({ error: "Teacher not found" });

        await teacher.remove();
        return res.status(200).json({ message: "Teacher removed successfully" });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error: " + err.message });
    }
}
export async function removeStudent(req, res) {
    try {
        const { student } = req;
        if (!student) return res.status(404).json({ error: "Student not found" });

        await student.remove();
        return res.status(200).json({ message: "Student removed successfully" });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error: " + err.message });
    }
}