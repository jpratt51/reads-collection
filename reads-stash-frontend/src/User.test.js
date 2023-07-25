import { render } from "@testing-library/react";
import User from "./User";

test("User renders without crashing", () => {
    render(<User />);
});
