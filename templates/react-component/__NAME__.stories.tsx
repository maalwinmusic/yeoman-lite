import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { __NAME__ } from "./__NAME__";

const meta: Meta<typeof __NAME__> = {
  title: "Components/__NAME__",
  component: __NAME__,
};
export default meta;

type Story = StoryObj<typeof __NAME__>;

export const Default: Story = {
  args: {},
};
