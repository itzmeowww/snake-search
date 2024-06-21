export default function Home() {
    const element = {
        wall: -1,
        empty: 0,
        snake: 1,
    };

    const grid = Array(11).fill().map(() => Array(11).fill(element.empty));

    // Set the walls on the edges
    for (let i = 0; i < 11; i++) {
        grid[0][i] = element.wall;
        grid[10][i] = element.wall;
        grid[i][0] = element.wall;
        grid[i][10] = element.wall;
    }

    // Place a snake element somewhere in the middle
    grid[5][5] = element.snake;
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div>

            </div>
        </main>
    );
}
