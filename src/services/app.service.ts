import { UrlModel, IUrl, IUser } from '../models/app.model';
import * as crypto from 'crypto';

/**
     * Check if the URL provided is valid.
     *
     * @param {string} url - The URL to check.
     * @returns {boolean} - Returns true if the URL is valid, otherwise false.
     * @private
     */
function isValidUrl(url: string) {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return url.match(urlRegex);
}

/**
 * Remove http://, https://, and www. from the URL provided.
 *
 * @param {string} url - The URL to clean.
 * @returns {string} - The cleaned URL.
 * @private
 */
function cleanUrl(url: string) {
    // Remove http:// or https://
    url = url.replace(/^https?:\/\//i, '');

    // Remove www.
    url = url.replace(/^www\./i, '');

    return url;
}

/**
 * Generate a shortened URL for the URL provided.
 *
 * @param {string} url - The URL to shorten.
 * @param {string} salt - The salt to use when generating the shortened URL.
 * @returns {string} - The shortened URL.
 * @private
 */
function generateShortenedUrl(url: string, salt: string): string {
    const hash = crypto.createHash('sha256').update(url + salt).digest('base64');
    const uniqueId = hash.substring(0, 7);
    const shortUrl = `${process.env.HOST}:${process.env.PORT}/${uniqueId}`;
    return shortUrl;
}
/**
 * This is the AppService class that handles logic related to shortening URLs.
 */
export class AppService {



    /**
     * Shorten the URL provided and save it to the database.
     *
     * @param {string} url - The URL to shorten.
     * @param {IUser | null | undefined} user - The user who is shortening the URL.
     * @returns {Promise<IUrl>} - A promise that resolves to the shortened URL object.
     * @throws {Error} - Throws an error if the URL is invalid.
     * @public
     */
    public static async shortenUrl(url: string, user: IUser | null | undefined): Promise<IUrl> {
        const email = user ? user.email : "";
        // Remove the http and https from the url in case it exists
        const cleanedUrl = cleanUrl(url);
        let shortened: IUrl;
        if (!isValidUrl(cleanedUrl)) {
            throw new Error("Invalid URL");
        }
        const existingDoc: IUrl | null = await UrlModel.findOne({ url: cleanedUrl, user: email });
        if (existingDoc) {
            let doc = await UrlModel.findOneAndUpdate({ url: cleanedUrl }, { $inc: { timesShortened: 1 } });
            shortened = doc!;
        } else {
            const shortenedUrl = generateShortenedUrl(cleanedUrl, user ? user.email : "");
            shortened = new UrlModel({ url: cleanedUrl, shortenedUrl: shortenedUrl, timesShortened: 1, timesAccessed: 0, user: email });
            await shortened.save();
        }
        return shortened;
    }

    /**
     * Get the original URL from the shortened URL provided and increment the timesAccessed counter in the database.
     *
     * @param {string} shortenedUrl - The shortened URL to retrieve the original URL from.
     * @returns {Promise<string | null>} - A promise that resolves to the original URL, or null if the shortened URL doesn't exist.
     * @public
     */
    public static async getUrlFromShortenedUrl(shortenedUrl: string): Promise<string | null> {
        const url: IUrl | null = await UrlModel.findOneAndUpdate({ shortenedUrl: shortenedUrl }, { $inc: { timesAccessed: 1 } });
        if (url) {
            return url.url;
        }
        return null;
    }
}