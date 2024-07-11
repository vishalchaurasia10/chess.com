export const navData = [
    {
        "name": "Home",
        "href": "/"
    },
    {
        "name": "Play",
        "href": "/game"
    },
    {
        "name": "Watch",
        "href": "/watch"
    },
]

type Theme = {
    boardStyle: {
        borderRadius: string;
        boxShadow: string;
        backgroundImage: string;
    };
    darkSquareStyle: {
        backgroundColor: string;
    };
    lightSquareStyle: {
        backgroundColor: string;
    };
};

export type Themes = {
    [key: string]: Theme;
};

export const themes: Themes = {
    fireAndIce: {
        boardStyle: {
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            backgroundImage: "linear-gradient(to bottom, #ff8c00, #1e3c72)"
        },
        darkSquareStyle: { backgroundColor: "#3f4b3b" },
        lightSquareStyle: { backgroundColor: "#d9d9d9" }
    },
    inferno: {
        boardStyle: {
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            backgroundImage: "linear-gradient(to bottom, #ff4500, #ff0000)"
        },
        darkSquareStyle: { backgroundColor: "#5a3426" },
        lightSquareStyle: { backgroundColor: "#ffcba4" }
    },
    nightSky: {
        boardStyle: {
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            backgroundImage: "linear-gradient(to bottom, #000428, #004e92)"
        },
        darkSquareStyle: { backgroundColor: "#2b3a67" },
        lightSquareStyle: { backgroundColor: "#a7c7e7" }
    },
    mysticForest: {
        boardStyle: {
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            backgroundImage: "linear-gradient(to bottom, #2c3e50, #27ae60)"
        },
        darkSquareStyle: { backgroundColor: "#1d4034" },
        lightSquareStyle: { backgroundColor: "#b8c6a4" }
    },
    sunsetGlow: {
        boardStyle: {
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            backgroundImage: "linear-gradient(to bottom, #ff7e5f, #feb47b)"
        },
        darkSquareStyle: { backgroundColor: "#854442" },
        lightSquareStyle: { backgroundColor: "#ffefd5" }
    }
};