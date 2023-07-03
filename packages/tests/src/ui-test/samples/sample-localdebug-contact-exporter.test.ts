/**
 * @author Ivan Chen <v-ivanchen@microsoft.com>
 */
import {
  Timeout,
  TemplateProject,
  TemplateProjectFolder,
  LocalDebugTaskResult,
  LocalDebugTaskLabel,
} from "../../constants";
import { startDebugging, waitForTerminal } from "../../vscodeOperation";
import { initPage, validateContact } from "../../playwrightOperation";
import { Env } from "../../utils/env";
import { SampledebugContext } from "./sampledebugContext";
import { it } from "../../utils/it";
import { VSBrowser } from "vscode-extension-tester";
import { getScreenshotName } from "../../utils/nameUtil";

describe("Sample Tests", function () {
  this.timeout(Timeout.testAzureCase);
  let sampledebugContext: SampledebugContext;

  beforeEach(async function () {
    // ensure workbench is ready
    this.timeout(Timeout.prepareTestCase);
    sampledebugContext = new SampledebugContext(
      TemplateProject.ContactExporter,
      TemplateProjectFolder.ContactExporter
    );
    await sampledebugContext.before();
  });

  afterEach(async function () {
    this.timeout(Timeout.finishAzureTestCase);
    await sampledebugContext.after();
  });

  it(
    "[auto] local debug for Sample Copntact Exporter",
    {
      testPlanCaseId: 12599484,
      author: "v-ivanchen@microsoft.com",
    },
    async function () {
      // create project
      await sampledebugContext.openResourceFolder();
      // await sampledebugContext.createTemplate();
      try {
        // local debug
        await startDebugging();

        console.log("wait frontend start");
        await waitForTerminal(
          LocalDebugTaskLabel.StartFrontend,
          LocalDebugTaskResult.FrontendSuccess
        );
      } catch (error) {
        await VSBrowser.instance.takeScreenshot(getScreenshotName("debug"));
        console.log("[Skip Error]: ", error);
        await VSBrowser.instance.driver.sleep(Timeout.playwrightDefaultTimeout);
      }

      const teamsAppId = await sampledebugContext.getTeamsAppId("local");
      console.log(teamsAppId);
      const page = await initPage(
        sampledebugContext.context!,
        teamsAppId,
        Env.username,
        Env.password
      );
      await validateContact(page, Env.displayName);
      console.log("debug finish!");
    }
  );
});
