import { describe, expect, it, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem("faq_session_id", "sess_test");
  });

  it("renders header and initial bot message", () => {
    const wrapper = mount(App);
    expect(wrapper.text()).toContain("多智能体 FAQ 客服 Demo");
    expect(wrapper.text()).toContain("你好，我是多智能体 FAQ 客服助手");
  });

  it("disables send button when input is empty", () => {
    const wrapper = mount(App);
    const btn = wrapper.get("button");
    expect(btn.attributes("disabled")).toBeDefined();
  });
});

