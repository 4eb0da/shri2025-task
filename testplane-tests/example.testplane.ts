describe("perf", () => {
    it("should look the same", async ({browser}) => {
        await browser.openAndWait('http://localhost:3000/');

        await browser.executeAsync((done) => {
            document.fonts.ready.then(done);
        });

        await browser.pause(1000);

        await browser.assertView('body', 'html');
    });
});
