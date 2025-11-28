export interface EventSection {
    id: string;
    name: string;
    price: number;
    capacity: number;
    isNumbered: boolean;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    venueName: string;
    imageUrl?: string;
    status: number; // 0: Draft, 1: Published
    sections: EventSection[];
}